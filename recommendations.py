import sys
import mysql.connector

def recommended_candidate(myresult):
	best_sum = float('inf')
	best_candidate = None

	for row in myresult:
		curr_sum = 0
		if row[1] == "Presidential_2020":
			for i in range(2, 21):
				curr_sum += abs(int(sys.argv[i+1]) - int(row[i]))
			if curr_sum < best_sum:
				best_sum = curr_sum
				best_candidate = row[0]

	print(best_candidate)
	sys.stdout.flush()

	return best_candidate

# --------------------------------------------
mydb = mysql.connector.connect(
  host = "localhost",
  user = "root",
  passwd = "password",
  database = "rrout2_foresight2020"
)

mycursor = mydb.cursor()
mycursor.execute("SELECT * FROM Candidates")
myresult = mycursor.fetchall()

recommended_candidate(myresult)
