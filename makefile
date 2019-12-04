CLIENT = cd client &&
SERVER = cd server &&

install:
	$(SERVER) npm install --no-optional
	$(CLIENT) npm install --no-optional

run_server:
	make run_db & $(SERVER) npm start

run_db:
	$(SERVER) mongod --dbpath=data

run_client:
	$(CLIENT) npm start

run_tests:
	$(SERVER) npm test

clean_db:
	$(SERVER) rm -rf data/
	$(SERVER) mkdir data/

clean:
	$(SERVER) rm -rf node_modules/
	$(CLIENT) rm -rf node_modules/
