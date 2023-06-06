const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("The Server is running at http://localhost:3003");
    });
  } catch (e) {
    console.log(e.message);
  }
};
initializeServer();
//API1
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT player_id AS playerId , player_name AS playerName
                            FROM player_details ORDER BY player_id`;
  const dbResponse = await db.all(getPlayerQuery);
  response.send(dbResponse);
});
//API2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT player_id AS playerId , player_name AS playerName
                            FROM player_details WHERE player_id=${playerId}`;
  const dbResponse = await db.get(getPlayerQuery);
  response.send(dbResponse);
});
//API3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const getPlayerQuery = `UPDATE 
                                player_details
                            SET  
                                player_name='${playerName}'
                             WHERE player_id=${playerId}`;
  const dbResponse = await db.all(getPlayerQuery);
  response.send("Player Details Updated");
});
//AP4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerQuery = `SELECT match_id AS matchId ,match ,year
                            FROM match_details WHERE match_id=${matchId}`;
  const dbResponse = await db.get(getPlayerQuery);
  response.send(dbResponse);
});
//AP5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchQuery = `SELECT
	                            match_details.match_id AS matchId,
	                            match_details.match AS match,match_details.year
                            FROM 
                                player_match_score NATURAL JOIN match_details
                            WHERE 
                                player_id='${playerId}';`;
  const dbresponse = await db.all(getMatchQuery);
  response.send(dbresponse);
});
//AP6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT
	                            player_details.player_id AS playerId,
	                            player_details.player_name AS playerName
                            FROM
                                player_match_score NATURAL JOIN player_details
                            WHERE 
                                match_id=${matchId};`;
  const dbresponse = await db.all(getMatchQuery);
  response.send(dbresponse);
});
//AP7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getScoreQuery = `SELECT 
                                player_id AS playerId,
                                player_details.player_name AS playerName,
                                SUM(score) AS totalScore,
                                SUM(fours) AS totalFours,
                                SUM(sixes) AS totalSixes
                            FROM 
                                player_match_score NATURAL JOIN player_details 
                            WHERE player_id=${playerId}`;
  const dbresponse = await db.get(getScoreQuery);
  response.send(dbresponse);
});

module.exports = app;
