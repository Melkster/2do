var bcrypt = require('bcrypt');

var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("melkersuger", salt);
var hash2 = bcrypt.hashSync("melkersuger", salt);


var users = [{
	name : 'melker',
	passwordhash : 'aa'
    },{
	name : 'michael',
	passwordhash : 'bb'
    },{
	name : 'axel',
	passwordhash : 'cc'
    },{
	name : 'vanja',
	passwordhash : 'dd'
    }]


async function hash_password(user, password){
    const hash3 = await bcrypt.hash(password, salt) 
    user = users.find(x => x.name == user)
    user['passwordhash'] = hash3;
}

async function compare_passwords(passwordhash, password){
    //console.log(passwordhash, password);
    const res = await bcrypt.compare(password, passwordhash);
    //console.log(res);
    return res;
}

async function authenticate(username, password){
    const found = users.find(x => x.name == username);
    if(!found){
	console.log('user does not exist')
    } else {
	const res = await compare_passwords(found['passwordhash'], password);
	//console.log(res);
	return res;
    }
}

//console.log(users.find(x => x.name == 'melker'));
(async () => {
    await hash_password('melker','melkersuger');
    await hash_password('michael', '123123');
    const auth = await authenticate('melker','melkersuger');
    //console.log(auth);
    if(!auth){
	console.log("authentication failed");
    } else {
	console.log("succesfull login");
    }
})();


export default auth;
