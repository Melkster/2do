var expect = require("chai").expect;
var io = require("socket.io-client");
var socketUrl = "http://localhost:3000";
var options = {
  transports: ["websocket"],
  "force new connection": true
};
describe("Socket event tests for server", async () => {
  it("Test register and authentication", done => {
    var client1 = io.connect(socketUrl);

    client1.on("connect", () => {
      client1.emit("register", "michael", "123123");
      client1.on("register", (userID, err) => {
        expect(userID).to.not.equal(null);
      });

      client1.emit("authenticate", "michael", "aaaaaa");
      client1.on("authenticate", (user, err) => {
        expect(user).to.equal(null);
      });
    });
    done();
  });

  it("test getUser", done => {
    var client2 = io.connect(socketUrl);

    client2.on("connect", () => {
      client2.emit("getUser", "michael");
      client2.on("getUser", (user, err) => {
        expect(user).to.not.equal(null);
        expect(user.name).to.equal("michael");
      });
    });
    done();
  });

  it("test group list and task adds", done => {
    var client = io.connect(socketUrl);

    client.on("connect", () => {});
    done();
  });
});
