var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//===========================
//COMMENTS ROUTES
//===========================


//NEW - show form to create new comment
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

// create new comment
router.post("/", middleware.isLoggedIn, function(req, res) {
    // res.send("POST NEW COMMENT");
    // lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if (err) {
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //connect new comment to campground
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    //redirect campground show
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    // res.send("TEST");
    Comment.findById(req.params.comment_id, function(err, comment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: comment});
        }
    });
});
    
//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err){
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// COMMENT DELETE ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if (err) {
           console.log(err);
           res.redirect("back");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

module.exports = router;