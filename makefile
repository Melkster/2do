CLIENT = cd client &&
SERVER = cd server &&

install:
	$(SERVER) npm install --no-optional
	$(CLIENT) npm install --no-optional

run_server:
	$(SERVER) pwd
	($(SERVER) mongod --dbpath=data & $(SERVER) npm start)

run_client:
	$(CLIENT) npm start

clean:
	$(SERVER) rm -rf node_modules/
	$(CLIENT) rm -rf node_modules/
