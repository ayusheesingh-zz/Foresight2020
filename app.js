const path = require('path');
var mysql = require('mysql');
var express = require('express');
const session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:datababez@cluster-foresight2020-rm95l.mongodb.net/test?retryWrites=true&w=majority"
const db_name = "mydb"

app.use(session({secret: 'ssshhhhh'}));

const port = 3000

app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

var router = express.Router();

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'rrout2_foresight2020'
})

app.get('/login', function (req, res) {
	sess = req.session;
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', function (req, res) {
	sess = req.session;

  	var tryy = "SELECT * FROM User WHERE username = '" + req.body.username + "' and password = '" + req.body.password + "'";
  	connection.query(tryy, function(err, rows, fields) {
		if (err){
			console.log('Error while performing Query.');
		    res.end();
		}

	  if (rows.length > 0) {
  			sess.username = req.body.username;
  			res.redirect('/landing');
		}
	});
});

app.post('/createaccount', function (req, res){
	var try1 = "SELECT MAX(UserID) as uid FROM User;";
	connection.query(try1, function(err2,rows2,fields2) {
		if(err2) {
			console.log('Error while performing Query to find max id.');
			res.end();
		} else {
      // console.log(rows2);
			var maxx = (rows2[0].uid == null) ? -1 : rows2[0].uid;
      // console.log(maxx);
			var newId = parseInt(maxx) + parseInt(1);

			var tryy = 'INSERT INTO User (userID,username,password, name, gender,rel_affiliation,ethnicity,age,party,income,occupation) VALUES('
			+ newId + ",'" + req.body.username + "','" + req.body.password + "','" + req.body.name + "','"
			+ req.body.gender + "','" + req.body.religion + "','" + req.body.ethnicity + "',"
			+ req.body.age + ",'" + req.body.party + "'," + req.body.income + ",'" + req.body.occupation + "')";
			connection.query(tryy, function(err1,rows1,fields1) {
				if(err1) {
					console.log("Querror (query error)");
					res.end();
				}

				var q2 = "SELECT max(surveyID) as surveyID FROM SurveyResults";
				connection.query(q2, function(err,row,fields){
					if (err) {
						console.log("errrr");
						res.end();
					}

					var maxy = (row.length == 0) ? 0 : row[0].surveyID;
					var survID = maxy + 1;

					var q5 = "INSERT INTO SurveyUser VALUES (" + newId + ", " + survID + ")";

					connection.query(q5, function(err,row,fields){
						if (err) {
							console.log("no u");
							res.end();
						}
						res.redirect('/login');
					});
				});
			});
		}
	});
});

app.get('/landing', function (req, res) {
	sess = req.session;
	if(!sess.username) {
		return res.redirect('/login');
	}

  var query = "SELECT sr.rec_name, u.name FROM User u JOIN SurveyUser su on u.userID = su.userID JOIN SurveyResults sr on su.surveyID = sr.surveyID WHERE username = '" + sess.username + "'";

  connection.query(query, function(err, row, fields) {
    var name = "New User";
    var rec = "No Previous Candidate Recommendation";
    if (err) {
      console.log("err");
      res.end();
    }

    if (row.length > 0) {
        name = row[0].name;
        rec = row[0].rec_name;
    }
    res.render(__dirname + "/landing.html", {name: name, rec: rec});
  });
});

app.post('/landing', function (req, res) {
	sess = req.session;

	var q1 = "SELECT userID FROM User WHERE username = '" + sess.username + "';";
	connection.query(q1, function(err, row, fields) {
		if (err) {
			console.log("errpep");
			res.end();
		}
		var userid = row[0].userID;

			var q3 = "SELECT surveyID FROM SurveyUser WHERE userID = " + userid + "";

			connection.query(q3, function(err,row, fields){
				if (err) {
					console.log("errrr56");
					res.end();
				}
        var newID = row[0].surveyID;

        var check = "SELECT * FROM SurveyResults WHERE surveyID = " + row[0].surveyID;
        connection.query(check, function(err, row, fields){
  				if (err) {
  					console.log("checkkck no wrk");
  					res.end();
  				}

          if (row.length == 0) { // new user
  					var q4 = "INSERT INTO SurveyResults VALUES (" + newID + ",'fake cand'," + req.body.abortion +
  					"," + req.body.employment + "," + req.body.same_sex_marriage  + "," + req.body.religion  + "," +
  					req.body.obamacare  + "," + req.body.social_security  + "," + req.body.education  + "," +
  					req.body.environment  + "," + req.body.crime  + "," + req.body.gun  + "," + req.body.taxes  + ","
  					+ req.body.immigrations  + "," + req.body.trade  + "," + req.body.foreign_policy  + "," + req.body.military  + "," +
  					req.body.voting  + "," + req.body.international_affairs  + "," + req.body.climate_change  + "," + req.body.drugs
  					  + "," + req.body.economy + ")";

  					connection.query(q4, function(err,row,fields){
  						if(err) {
  							console.log("f");
  							res.end();
  						}

  						var q6 = "INSERT INTO CandidateRecommendation VALUES (" + userid + ", 'Fake Cand', '" + (new Date()).toLocaleDateString() + "')";

  						connection.query(q6, function(err,row,fields){
  							if(err) {
  								console.log("NoooOOOoOoOOoooOOO");
  								res.end();
  							}
              				res.redirect('/recommendation')
                      // res.send("Success!~");
  						});
  					});
  				} else {
  					var qury = "UPDATE SurveyResults SET rec_name = 'New Fake Candidate', abortion = " + req.body.abortion +
  						", employment = " + req.body.employment + ", same_sex_marriage = " + req.body.same_sex_marriage +
  						", religion = " + req.body.religion + ", obamacare = " + req.body.obamacare +
  						", social_security = " + req.body.social_security + ", education = " + req.body.education +
  						", environment = " + req.body.environment + ", crime=" + req.body.crime +
  						", gun = " + req.body.gun + ", taxes=" + req.body.taxes + ", immigrations=" + req.body.immigrations +
  						", trade = " + req.body.trade + ", foreign_policy = " + req.body.foreign_policy +
  						", military = " + req.body.military + ", voting = " + req.body.voting +
  						", international_affairs = " + req.body.international_affairs + ", climate_change = " + req.body.climate_change +
  						", drugs = " + req.body.drugs + ", economy = " + req.body.economy + " WHERE surveyID = " + newID;

  						connection.query(qury, function(err, row, fields){
  							if (err) {
  								console.log("eh");
  								res.end();
  							}
  							var qqq = "UPDATE CandidateRecommendation SET candidateName = " + "'New Fake Candidate'" + ", dateRecommended = '" + (new Date()).toLocaleDateString() + "'" + " WHERE userID = " + userid;
  							connection.query(qqq, function(err, row, fields){
  								if (err) {
  									console.log("lonsole.cog");
  								}
                  res.redirect('/recommendation')
                  // res.send("Success!~");
  							});
  						});
  				}

        });
			});
		});

});

app.get('/recommendation', function (req, res) {
    sess = req.session;
    if(!sess.username) {
        return res.redirect('/login');
    }

    var query = "SELECT u.userID, sr.surveyID, sr.abortion, sr.employment, sr.same_sex_marriage, sr.religion, sr.obamacare, sr.social_security, sr.education, sr.environment, sr.crime, sr.gun, sr.taxes, sr.immigrations, sr.trade, sr.foreign_policy, sr.military, sr.voting, sr.international_affairs, sr.climate_change, sr.drugs, sr.economy FROM User u JOIN SurveyUser su on u.userID = su.userID JOIN SurveyResults sr on su.surveyID = sr.surveyID WHERE username = '" + sess.username + "'";

    connection.query(query, function(err, row, fields){
        if (err) {
            console.log("no oooo odsod");
            res.end();
        }
            const spawn = require('child_process').spawn;
            const ls = spawn('python', ['recommendations.py','filler', 'filler', row[0].abortion, row[0].employment, row[0].same_sex_marriage, row[0].religion, row[0].obamacare, row[0].social_security, row[0].education, row[0].environment, row[0].crime, row[0].gun, row[0].taxes, row[0].immigrations, row[0].trade, row[0].foreign_policy, row[0].military, row[0].voting, row[0].international_affairs, row[0].climate_change, row[0].drugs, row[0].economy]);
            var userid = row[0].userID;
            var survID = row[0].surveyID;

            ls.stdout.on('data', function (data) {
                var qqq = "UPDATE CandidateRecommendation SET candidateName = '" + `${data}` + "', dateRecommended = '" + (new Date()).toLocaleDateString() + "'" + " WHERE userID = " + userid;
                connection.query(qqq, function(err, row, fields){
                    if (err) {
                        console.log("FINAL REC DIDNT WORK :)((((((((((((((((( oops");
                        res.end();
                    }

                    var qu = "UPDATE SurveyResults SET rec_name = '" + `${data}` + "' WHERE surveyID = " + survID;
                    connection.query(qu, function(err, row, fields){
                        if (err) {
                            console.log("FINAL FINAL UPDATE REC DIDNT WORK :)((((((((((((((((( oops");
                            res.end();
                        }

                        var cand = `${data}`;
                        const ls2 = spawn('python', ['reddit.py', cand]);

                        ls2.stdout.on('data', (data) => {
                            console.log(`stdout: ${data}`);
                            MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
                              if (err) console.log(err);
                              db = client.db(db_name);
                              var cands = db.collection('candidate');
                              // docs = [];
                              cands.find({}).forEach((doc) => {
                                if(doc['name'] == cand.trim()) {
                                    // docs.push(doc);
                                    res.render(__dirname + "/recommendation.html", {rec: cand, reddit_link: doc['posts']});
                                }
                              });

                            });
                        });
                        ls2.stderr.on('data', (data) => {console.log(`stderr: ${data}`);});
                        ls2.on('close', (code) => {console.log(`child process exited with code ${code}`);});
                   });

                });
            });
            ls.stderr.on('data', (data) => {console.log(`stderr: ${data}`);});
            ls.on('close', (code) => {console.log(`child process exited with code ${code}`);});
    });
});

app.post('/recommendation', function (req, res) {
  res.redirect('/landing');
});

app.get('/createaccount', function (req, res) {
  res.sendFile(__dirname + '/createaccount.html');
});

app.get('/delete', function (req, res) {
	sess = req.session;
	if(!sess.username) {
		return res.redirect('/login');
	}

  res.sendFile(__dirname + '/delete.html');

});

app.post('/delete', function (req, res) {
	sess = req.session
	user = sess.username;

  var another = "SELECT userID FROM User WHERE username = '" + user + "'";

  connection.query(another, function(err, row, fields) {
    if (err) {
      console.log("ferefer");
      res.send();
    }
    var useridd = row[0].userID;


	var q = "SELECT surveyID FROM SurveyUser WHERE userID = '" + useridd + "'";
	connection.query(q, function(err, row, fields){
		if (err) {
			console.log("aw man");
			res.end();
		}

    var survyID = row[0].surveyID;
    var check = "SELECT * FROM SurveyResults WHERE surveyID = " + survyID + ";";
    connection.query(check, function(err, roww, fields){
      if (err) {
        console.log("checkkck no wrk");
        res.end();
      }
        if (roww.length == 0) { // no survey submission
          res.redirect('/landing');
        } else {
          var del_query = "DELETE FROM SurveyResults WHERE surveyID = " + survyID;
          connection.query(del_query, function(new_err, new_row, fields){
            if (new_err) {
              console.log("no god");
              res.end();
            }
            res.redirect('/landing');
          });
        }
    });
  });
});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app;
