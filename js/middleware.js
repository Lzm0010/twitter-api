//=========== LOAD MODULES ==========//

//config module for twitter api
const api = require('../config');

//moment js for dates module
const moment = require('moment');

//twitter object api module
const Twit = require('twit');


//=========== TWIT OBJECT ==========//

//create new Twit obj based on twit module docs
let T = new Twit({
  consumer_key:         api.consumer_key,
  consumer_secret:      api.consumer_secret,
  access_token:         api.access_token,
  access_token_secret:  api.access_token_secret
});


//======== MIDDLEWARE METHODS =========//

//middleware making the API request to twitter
//store appropriate info in variables to display in index
//use destructuring to gather subset of info wanted to store from tweet object
//push my object to local variable
let middleware = {


    //======== GET TWEETS =========//

    //using es6 and destructing on all methods
    //to pluck properties into my own custom obj
    getTweets: function(req, res, next){
      T.get('statuses/user_timeline', {count: 5}, function(err, data, response) {
        if (err) return next(err);

        res.locals.name = data[0].user.name;
        res.locals.username = data[0].user.screen_name;
        res.locals.profilePic = data[0].user.profile_image_url_https;
        res.locals.background = data[0].user.profile_banner_url;
        res.locals.following = data[0].user.friends_count;

        res.locals.tweets = [];
        for(let object in data) {
          const tweetObj = data[object];
          const myTweetObj = (({text, created_at, retweet_count, favorite_count}) => ({text, created_at, retweet_count, favorite_count}))(tweetObj);
          myTweetObj.created_at = moment(myTweetObj.created_at).fromNow();
          res.locals.tweets.push(myTweetObj);
        }

        next();
      });
    },


    //======== GET FRIENDS =========//

    getFriends: function(req, res, next){
      T.get('friends/list', {count: 5}, function(err, data, response){
        if (err) return next(err);

        res.locals.friends = [];
        const users = data.users;
        for(let user in users) {
          const userObj = users[user];
          const myUserObj = (({name, screen_name, profile_image_url_https}) => ({name, screen_name, profile_image_url_https}))(userObj);
          res.locals.friends.push(myUserObj);
        }
        next();
      });
    },


    //======== GET MSGS SENT TO ME =========//

    //object assign combines the two objects
    getMessages: function(req, res, next){
      T.get('direct_messages', function(err, data, response){
        if (err) return next(err);

        res.locals.dms = [];
        for(let object in data){
          const msgObj = data[object];
          const myMsgObj = (({text, created_at}) => ({text, created_at}))(msgObj);
          myMsgObj.created_at = moment(myMsgObj.created_at).fromNow();

          const sender = data[object].sender;
          const mySender = (({name, screen_name, profile_image_url_https}) => ({sender_name: name, sender_screen_name: screen_name, profile_image_url_https}))(sender);

          Object.assign(myMsgObj, mySender);

          res.locals.dms.push(myMsgObj);
        }

        next();
      });
    },


    //======== GET MSGS I SENT =========//

    getSentMessages: function(req, res, next){
      T.get('direct_messages/sent', function (err, data, response){
        if (err) return next(err);

        res.locals.dmsSent = [];
        for(let object in data){
          const msgObj = data[object];
          const myMsgObj = (({text, created_at}) => ({text, created_at}))(msgObj);
          myMsgObj.created_at = moment(myMsgObj.created_at).fromNow();

          const recipient = data[object].recipient;
          const myRecip = (({screen_name}) => ({recipient_screen_name: screen_name}))(recipient);

          Object.assign(myMsgObj, myRecip);

          res.locals.dmsSent.push(myMsgObj);
        }

        next();
      });
    },


    //======== CREATE CONVOS =========//

    //convo object takes dms sent and received and
    //then pushes them to a new convo object if they are with the same two users
    //if convo object doesnt exist yet it creates a new one
    //then sorts them by time created_at
    createConvo: function(req, res, next){
      res.locals.convos = {};
      const convos = res.locals.convos;
      const dms = res.locals.dms;
      const dmsSent = res.locals.dmsSent;

      for (let dm in dms){
        const msgObj = dms[dm];

        if (convos.hasOwnProperty(msgObj.sender_screen_name)){
          let prop = msgObj.sender_screen_name;
          convos[prop].push(msgObj);
        } else {
          let newPropName = msgObj.sender_screen_name;
          convos[newPropName] = [msgObj];
        }
      }

      for (let dm in dmsSent){
        const msgObj = dmsSent[dm];

        if (convos.hasOwnProperty(msgObj.recipient_screen_name)){
          let prop = msgObj.recipient_screen_name;
          convos[prop].push(msgObj);
        } else {
          let newPropName = msgObj.recipient_screen_name;
          convos[newPropName] = [msgObj];
        }
      }

      for (let convo in convos){
        const myConvo = convos[convo];
        myConvo.sort(function (a, b) {
          return a.created_at - b.created_at;
        });
      }

      next();
    },


    //======== POST TWEET =========//

    //uses twit module method to post a tweet through twitter API
    postTweet: function(status){
      T.post('statuses/update', { status }, function(err, data, response) {
        if (err) {
          console.log(err);
        }
      });
    }
}


//====== EXPORT MIDDLEWARE ======//

module.exports = middleware;
