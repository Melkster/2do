CLIENT = cd client &&
SERVER = cd server &&

install:
	$(SERVER) npm install --no-optional
	$(CLIENT) npm install --no-optional

run_server:
	make run_db & $(SERVER) npm start

run_db:
	$(SERVER) mongod --dbpath=data & $(SERVER) mongo --eval "db.users.createIndex({username: 1}, {unique: true})"

run_client:
	$(CLIENT) npm start

clean:
	$(SERVER) rm -rf node_modules/
	$(SERVER) rm -rf data/
	$(CLIENT) rm -rf node_modules/
