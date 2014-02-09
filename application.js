$(function() {
  var Issue = Backbone.Model.extend({
    isToDo: function() {
      return this.get("state") == "open";
    },

    isInProgress: function() {
      return this.get("state") == "open" && this.hasPullRequest();
    },

    isDone: function() {
      return this.get("state") == "closed";
    },

    hasPullRequest: function() {
      var url = this.get("pull_request").html_url;
      return url !== null;
    }
  });

  var Milestone = Backbone.Model.extend({
    initialize: function() {
      this.openIssues = new IssueList;
      this.closedIssues = new IssueList;
      this.openIssues.url = "https://api.github.com/repos/" + this.get("org") + "/" + this.get("repo") + "/issues?state=open&milestone=" + this.id;
      this.closedIssues.url = "https://api.github.com/repos/" + this.get("org") + "/" + this.get("repo") + "/issues?state=closed&milestone=" + this.id;
    }
  });

  var IssueList = Backbone.Collection.extend({
    model: Issue,

    toDo: function() {
      return _(this.filter(function(issue) { return issue.isToDo() }));
    },

    inProgress: function() {
      return _(this.filter(function(issue) { return issue.isInProgress() }));
    },

    done: function() {
      return _(this.filter(function(issue) { return issue.isDone() }));
    }
  });

  var BoardView = Backbone.View.extend({
    tagName: "div",
    id: "board",

    initialize: function() {
      this.toDoSectionView       = new SectionView({ model: this.model.openIssues });
      this.inProgressSectionView = new SectionView({ model: this.model.openIssues });
      this.doneSectionView       = new SectionView({ model: this.model.closedIssues });

      this.toDoSectionView.title = "To Do";
      this.toDoSectionView.filter = function(issue) { return !issue.hasPullRequest() };

      this.inProgressSectionView.title = "In Progress";
      this.inProgressSectionView.filter = function(issue) { return issue.hasPullRequest() };

      this.doneSectionView.title = "Done";
      this.doneSectionView.filter = function() { return true };

      this.$el.append(this.toDoSectionView.el);
      this.$el.append(this.inProgressSectionView.el);
      this.$el.append(this.doneSectionView.el);
    },

    render: function() {
      this.toDoSectionView.render();
      this.inProgressSectionView.render();
      this.doneSectionView.render();

      return this;
    }
  });

  var SectionView = Backbone.View.extend({
    render: function() {
      var section = this;
      var issues = _(this.model.filter(this.filter));

      this.$el.html("<h3>" + this.title + "</h3>");

      issues.each(function(issue) {
        var cardView = new CardView({ model: issue });
        cardView.render();
        section.$el.append(cardView.el);
      });

      return this;
    }
  });

  var CardView = Backbone.View.extend({
    tagName: "div",
    className: "card",

    template: function() {
      var source = '<%= issue.get("title") %>';
      return _.template(source, { issue: this.model });
    },

    render: function() {
      this.$el.html(this.template());

      return this;
    }
  });

  var org = "zendesk", repo = "curly", milestoneId = 1;
  var milestone = new Milestone({ org: org, repo: repo, id: milestoneId });

  var boardView = new BoardView({ model: milestone });

  window.board = boardView;

  milestone.openIssues.fetch({
    success: function() {
      boardView.render();
    }
  });

  milestone.closedIssues.fetch({
    success: function() {
      boardView.render();
    }
  });

  $("body").append(boardView.el);
});
