import sys
import praw
from pymongo import MongoClient

reddit = praw.Reddit(client_id='W_95bcSkHviZ2g', client_secret='tJvJ94szeLQRbaibhtF-06nnFmw', user_agent='Foresight2020')

def find_hot_posts(candidate_name):
	subreddit_names = ['Politics', 'Ask_Politics', 'Democrats', 'Republican', 'PoliticalDiscussion']
	res=iterate_through_subreddit(candidate_name, subreddit_names)
	print(res)
	return res

def iterate_through_subreddit(candidate_name, subreddit_names):
	candidate_name = candidate_name.split("_")
	results = []
	for subreddit_name in subreddit_names:
		hot_posts = reddit.subreddit(subreddit_name).hot(limit=50)
		for post in hot_posts:
			if (candidate_name[1].casefold()[:-1] in post.title.casefold()):
				results.append(post.title + '\n')
	return results

reddit_posts = find_hot_posts(sys.argv[1])
client = MongoClient("mongodb+srv://dbUser:datababez@cluster-foresight2020-rm95l.mongodb.net/test?retryWrites=true&w=majority")

mydict = {"name" : sys.argv[1].rstrip("\n"), "posts" : reddit_posts}

with client:
	db = client.mydb #
	myname = {"name" : sys.argv[1].rstrip("\n")}
	db.candidate.update(myname, mydict, upsert=True)
