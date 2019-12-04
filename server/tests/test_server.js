var expect = require("chai").expect;
var io = require("socket.io-client");
var socketUrl = "http://localhost:3000";
var options = {
  transports: ["websocket"],
  "force new connection": true
};

var USERID;
var listID;
var group;
var list;
describe("Socket event test for the server", async () => {
  it("Test register and authentication", done => {
    var client = io.connect(socketUrl);

    client.on("connect", () => {
      client.emit("register", "michael", "123123");
      client.on("register", (userID, err) => {
        expect(userID).to.not.equal(null);

        client.emit("getUser", "michael");
        client.on("getUser", (user, err) => {
          expect(user).to.not.equal(null);
          expect(user.name).to.equal("michael");
        });

        client.emit("authenticate", "michael", "aaaaaa");
        client.on("authenticate", (user, err) => {
          expect(user).to.equal(null);
          client.emit("createGroup", userID, "group1");
          client.on("createGroup", (groups, err) => {
            var groupID = groups[0]._id;
            group = groups[0];
            expect(group._id).to.not.equal(null);
            expect(group.name).to.equal("group1");
            client.emit("renameGroup", groupID, userID, "UpdatedGroup");
            client.on("renameGroup", (groups, err) => {
              group = groups[0];
              expect(group.name).to.equal("UpdatedGroup");
            });
            client.emit("createList", groupID, "list1");
            client.on("createList", (lists, err) => {
              var listID = lists[0]._id;
              list = lists[0];
              expect(listID).to.not.equal(null);
              expect(list.name).to.equal("list1");
              expect(list.tasks).to.deep.equal([]);
              expect(lists.length).to.equal(1);
              client.emit("renameList", groupID, userID, "UpdatedList");
            });
          });
        });
      });
    });
    done();
  });
});

// async function setup(socket) {
//   socket.emit("register", "michael", "123123");
// }

// describe("Socket event test for the server", async () => {
//   describe("Test register and authentication", () => {
//     it("Test register and authentication", done => {
//       var client1 = io.connect(socketUrl);

//       client1.on("connect", () => {
//         client1.emit("register", "michael", "123123");
//         client1.on("register", (userID, err) => {
//           expect(userID).to.not.equal(null);
//           USERID = userID;
//         });

//         client1.emit("authenticate", "michael", "aaaaaa");
//         client1.on("authenticate", (user, err) => {
//           expect(user).to.equal(null);
//         });
//       });
//       done();
//     });
//   });

//   describe("get user test", () => {
//     it("test getUser", done => {
//       var client2 = io.connect(socketUrl);

//       client2.on("connect", () => {
//         client2.emit("getUser", "michael");
//         client2.on("getUser", (user, err) => {
//           expect(user).to.not.equal(null);
//           expect(user.name).to.equal("michael");
//         });
//       });
//       done();
//     });
//   });

//   describe("group stuff", () => {
//     it("test group list and task adds", done => {
//       var client = io.connect(socketUrl);

//       client.on("connect", () => {
//         client.emit("createGroup", USERID, "group1");
//         client.on("createGroup", (groups, err) => {
//           expect(groups).to.not.equal(null);
//           expect(groups[0].name).to.equal("group1");
//         });
//       });
//       done();
//     });
//   });
// });

// // async function setup(socket) {
// //   socket.emit("register", "michael", "123123");
// // }
