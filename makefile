CLIENT = cd client &&
SERVER = cd server &&

run_server:
	$(SERVER) pwd
	($(SERVER) mongod --dbpath=data & $(SERVER) npm start)

run_client:
	$(CLIENT) npm start

