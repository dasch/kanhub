$(function() {
  var Issue = Backbone.Model.extend({
    
  });

  var Milestone = Backbone.Model.extend({
    initialize: function() {
      this.issues = new IssueList;
      this.issues.url = "https://api.github.com/repos/" + this.get("org") + "/" + this.get("repo") + "/issues?milestone=" + this.id;
    }
  });

  var IssueList = Backbone.Collection.extend({
    model: Issue
  });

  var BoardView = Backbone.View.extend({
    tagName: "div",
    id: "board",

    initialize: function() {
      this.listenTo(this.model.issues, "change", this.render);
    },

    render: function() {
      var board = this;

      this.model.issues.each(function(issue) {
        var cardView = new CardView({ model: issue });
        cardView.render();
        board.$el.append(cardView.el);
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

  var org = "dasch", repo = "kanhub", milestoneId = 1;
  var milestone = new Milestone({ org: org, repo: repo, id: milestoneId });

  var boardView = new BoardView({ model: milestone });

  window.board = boardView;

  milestone.issues.fetch({
    success: function() {
      boardView.render();
    }
  });

  $("body").append(boardView.el);
});
