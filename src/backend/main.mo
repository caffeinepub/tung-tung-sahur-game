import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type ScoreEntry = {
    name : Text;
    score : Nat;
  };

  module ScoreEntry {
    public func compare(entry1 : ScoreEntry, entry2 : ScoreEntry) : Order.Order {
      Nat.compare(entry2.score, entry1.score);
    };
  };

  var leaderboard : [ScoreEntry] = [];

  public shared ({ caller }) func submitScore(name : Text, score : Nat) : async () {
    let newEntry : ScoreEntry = {
      name;
      score;
    };

    let newLeaderboard = (leaderboard.concat([newEntry])).sort().sliceToArray(0, 10);
    leaderboard := newLeaderboard;
  };

  public query ({ caller }) func getLeaderboard() : async [ScoreEntry] {
    leaderboard;
  };

  public query ({ caller }) func getPlayerRank(score : Nat) : async Nat {
    for (i in leaderboard.keys()) {
      if (leaderboard[i].score == score) {
        return i + 1; // Ranks start from 1
      };
    };
    Runtime.trap("Score not found in leaderboard");
  };
};
