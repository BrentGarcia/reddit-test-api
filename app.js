

require('dotenv').config();
var _ = require('lodash');
var fs = require('fs');
const Snoowrap = require('snoowrap');

// Build Snoowrap client & Listing Options to apply
const r = new Snoowrap({
  userAgent: 'reddit-api-internship-test',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS
});

const ListingOptions = {
  limit: 100
}

// Setup Json to CSV Parser & choose fields to display
const { Parser } = require('json2csv');
const fields = ['title', 'url', 'ups', 'num_comments'];
const json2csvParser = new Parser({ fields });



// Get List of Original Content
r.getHot('popular',ListingOptions).then(posts => {
  let originalContentList = [];

  posts.map(submission => submission.is_original_content ? originalContentList.push(submission): undefined)
  const csv = json2csvParser.parse(originalContentList);

  fs.writeFile('Original_content.csv', csv, function(err) {
    if (err) throw err;
    console.log('OC file saved');
    });
});

// Get List of sub's with more than 1000 comments
r.getHot('popular',ListingOptions).then(posts => {
  let oneThousandCommentsList = [];

  posts.map(submission => submission.num_comments > 1000 ? oneThousandCommentsList.push(submission): undefined)
  const csv = json2csvParser.parse(oneThousandCommentsList);

  fs.writeFile('Over_one_thousand_comments.csv', csv, function(err) {
    if (err) throw err;
    console.log('100 Comments file saved');
    });

});

// Get List of top 10 submissions by upvotes in descending order
r.getHot('popular',ListingOptions).then(posts => {
  let submissionList = [];
  let sortedTop10SubmissionsList = new Array(10);

  posts.map(submission => submissionList.push(submission))
  let newList = _.sortBy(submissionList, ['ups'])
  let reverseList = _.reverse(newList)

  for (let i = 0; i < 10; i++){
    sortedTop10SubmissionsList[i] = reverseList[i];
  }

  const csv = json2csvParser.parse(sortedTop10SubmissionsList);

  fs.writeFile('Top_10_by_upvotes.csv', csv, function(err) {
    if (err) throw err;
    console.log('Top 10 submissions by upvotes file saved');
    });
});

// Get List of all unique subreddits
r.getHot('popular',ListingOptions).then(posts => {
  let allSubredditsList = [];

  posts.map(submission => allSubredditsList.push(submission))
  let uniqueSubList = _.uniqBy(allSubredditsList, 'subreddit_name_prefixed')

  const csv = json2csvParser.parse(uniqueSubList);

  fs.writeFile('Unique_subreddits.csv', csv, function(err) {
    if (err) throw err;
    console.log('Unique subreddits file saved');
    });
});

// Creates a multireddit with all subreddits appearing in top 100 posts more than once
r.getHot('popular',ListingOptions).then(posts => {
  let allSubList = [];
  posts.map(submission => allSubList.push(submission))

  let multiList = _.difference(allSubList, _.uniqBy(allSubList, 'subreddit_name_prefixed'))
  multiList.map(post => r.getUser(r.username).getMultireddit('assessment_multireddit').addSubreddit(post.subreddit.display_name))
});






