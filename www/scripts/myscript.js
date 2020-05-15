var av = null
window.onload = function() {
	//实例并初始化我们的hichat程序
	av = new AvLong()
}

class Tool{
	constructor(){

	}

	calc_pos_in_circule(radius, id, total_count, x_offset, y_offset){
		let angle = Math.PI * 2 / total_count * id
		// if(angle >= 0 && angle < Math.PI/2){
		// 	angle -= angle / 25
		// }
		// else if(angle >= 90 && angle < Math.PI){
		// 	angle += (Math.PI - angle) / 25
		// }
		// else if(angle >= Math.PI && angle < 1.5 * Math.PI){
		// 	angle += (angle - Math.PI) / 25
		// }
		// else{
		// 	angle += (2 * Math.PI - angle) / 25
		// }
		radius += total_count*15
		let x = radius * Math.sin(angle)
		let y = radius * Math.cos(angle)
		return ["" + (x*1.2 + x_offset) + "px", "" + (-y/1.2 + y_offset) + "px"]
	}
}

var tool = new Tool()

class Player{
    constructor(){
        this.name = null
        this.role = null
        this.id = null
    }
}

class AvLong{
	constructor(){
		var that = this;

		// document.getElementById("player_list").innerHTML = that.generate_player_circle(9)
		// that.set_player_avatar_positions(9)
		// return
		this.socket = io.connect()

		//register button behaviors
		document.getElementById('ready_button').addEventListener('click', function() {
			if(that.state == 0){
				let nick_name = document.getElementById('nickname_input').value;

				if (nick_name.trim().length != 0) {
					that.player.name = nick_name
					document.getElementById('nickname_input').placeholder = nick_name
					that.state = 1
					that.socket.emit('ready_request', nick_name);
			    } else {
			        document.getElementById('nickname_input').focus();
			    };
			}
		}, false)

		document.getElementById('agree_button').addEventListener('click', function() {
			if(that.state == 6){
				that.state = 2
				console.log("clicked agree")
				that.socket.emit('vote_done', 'agree')
				document.getElementById('vote_buttons').style.display = "none"
			}
		}, false)

		document.getElementById('disagree_button').addEventListener('click', function() {
			if(that.state == 6){
				that.state = 2
				console.log("clicked disagree")
				that.socket.emit('vote_done', 'disagree')
				document.getElementById('vote_buttons').style.display = "none"
			}
		}, false)

		document.getElementById('success_button').addEventListener('click', function() {
			if(that.state == 5){
				that.state = 2
				console.log("clicked success")
				that.socket.emit('mission_done', 'success')
				document.getElementById('mission_buttons').style.display = "none"
			}
		}, false)

		document.getElementById('failure_button').addEventListener('click', function() {
			if(that.state == 5){
				that.state = 2
				console.log("clicked failure")
				that.socket.emit('mission_done', 'failure')
				document.getElementById('mission_buttons').style.display = "none"
			}
		}, false)

		document.getElementById('confirm_button').addEventListener('click', this.confirm_button_callback, false)

		document.getElementById('again_button').addEventListener('click', function() {
			document.getElementById('result_wrapper').style.display = "none"
			that.init()
		}, false)

		document.getElementById('speaking_done_button').addEventListener('click', this.speaking_done_button_callback, false)
		//register done

		//register socket callbacks
		this.socket.on('connect', function() {
			
        });

        this.socket.on('update_ready_info', function(count_connected, count_ready) {
        	if(that.state == 1){
	        	let info = "Welcome " + that.player.name + "<br>Connected: " + count_connected + "<br>Ready: " + count_ready + "<br>Game will start automatically when everyone is ready"
	        	document.getElementById('connection_info').innerHTML = info;
	        	document.getElementById('nick_wrapper').style.display = 'none';
	        }
        });

        this.socket.on('game_start', function(my_role, my_id, my_thumbs, names, group_sizes) {
        	if(that.state == 1){
        		document.getElementById("status_label").innerHTML = '游戏开始'
        		document.getElementById("status_label").style.display = 'block'
	        	//generate the layout
	        	that.count_player = names.length
	        	that.player_names = names
	        	document.getElementById("player_list").innerHTML = that.generate_player_circle(that.count_player)
				that.set_player_avatar_positions(that.count_player)
				that.set_avatar_size()

				//set names and callback for avatar buttons
	        	for(let i = 0; i < that.count_player; i++){
	        		document.getElementById("name_label_"+i).innerHTML = names[i]
	        		document.getElementById('avatar_button_' + i).addEventListener('click', that.avatar_button_callback, false)
	        		document.getElementById("avatar_button_" + i).style.backgroundImage = "url('../img/back.jpeg')"
					document.getElementById("avatar_button_" + i).style.backgroundPosition = "50% 50%"
			    	document.getElementById("avatar_button_" + i).style.backgroundSize = "135% 125%"
	        	}
	        	
	        	//set my role and my visibility
	        	that.player.role = my_role
	        	that.player.id = my_id
	        	that.set_role(my_role, my_id)

	        	//show thumbs
	        	for(let id in my_thumbs){
	        		if(my_role == "刺客" || my_role == "坏人" || my_role == "莫甘娜" || my_role == "莫德雷德"){
	        			let role = my_thumbs[id]
	        			that.set_role(role, id)
	        		}
	        		else{
						document.getElementById("avatar_button_" + id).style.backgroundPosition = "50% 50%"
				    	document.getElementById("avatar_button_" + id).style.backgroundSize = "100% 80%"
	        			document.getElementById("avatar_button_" + id).style.backgroundImage = "url('../img/thumb.png')"
	        		}
	        	}

	        	//set group size requirements
	        	for(let i = 0; i < 5; i++){
	        		document.getElementById("outer_round_" + i).innerHTML = group_sizes[i]
	        	}
	        	//hide login wrapper
	        	document.getElementById('login_wrapper').style.display = 'none'

	        	//show round rows
	        	document.getElementById('outer_round_row').style.display = 'flex'
	        	document.getElementById('inner_round_row').style.display = 'flex'
	        	if(that.count_player  == 6){
		        	document.getElementById('roles_label').innerHTML = '游戏配置：6人：梅林、派西维尔、忠臣*2 vs 莫甘娜、刺客 '
		        }
		        else if(that.count_player  == 7){
		        	document.getElementById('roles_label').innerHTML = '游戏配置：7人：梅林、派西维尔、忠臣*2 vs 莫甘娜、奥伯伦、刺客  '
		        }
		        else if(that.count_player  == 8){
		        	document.getElementById('roles_label').innerHTML = '游戏配置：8人：梅林、派西维尔、忠臣*3 vs 莫甘娜、刺客、爪牙  '
		        }
		        else if(that.count_player  == 9){
		        	document.getElementById('roles_label').innerHTML = '游戏配置：9人：梅林、派西维尔、忠臣*4 vs 莫德雷德、莫甘娜、刺客 '
		        }
	        	//set state to game started
	        	that.state = 2
	        	that.socket.emit("started")
	        }
        });

        this.socket.on('pick_group', function(leader, group_size, inner_round) {
        	if(that.state == 2){
        		document.getElementById("status_label").innerHTML = '组队中'
        		if(inner_round == 0){
        			//clear the old color of last outer round for all inner round boxes
        			that.clear_inner_round_boxes()
        			that.reset_avatar_id();
        			that.reset_avatar_name();
        		}

        		that.reset_avatar_border();
        		document.getElementById("id_label_" + (leader + that.count_player - 1) % that.count_player).innerHTML = "" + ((leader + that.count_player - 1) % that.count_player + 1)
        		document.getElementById("id_label_" + leader).innerHTML = "" + (leader + 1) + ": 队长"
        		document.getElementById("inner_round_" + inner_round).style.backgroundColor = "yellow"
        		if(leader == that.player.id){ 
        			that.state = 4
        			that.group_size = group_size
        			document.getElementById("confirm_button").style.display = "block"
        		}
	        }
        });

        this.socket.on('vote', function(group) {
        	if(that.state == 2){
        		document.getElementById("status_label").innerHTML = '投票中'
        		that.state = 6
        		that.reset_avatar_border();
        		that.reset_avatar_name();
        		for(let i of group){
        			document.getElementById("avatar_button_" + i).style.border = "thick solid blue"
        		}
        		document.getElementById("vote_buttons").style.display = "flex"
	        }
        });

        this.socket.on('someone_voted', function(id) {
        	if(that.state == 2 || that.state == 6){
        		document.getElementById("name_label_" + id).innerHTML = that.player_names[id] + ": 已投票"
	        }
        });

        this.socket.on('vote_result', function(passed, inner_round, vote_result, leader){
        	if(that.state == 2){

        		let info = ""
	        	for(let i = 0; i < that.count_player; i++){
	        		if(vote_result[i] == true){
	        			document.getElementById("name_label_" + i).innerHTML = that.player_names[i] + ": 同意"
	        			info += that.player_names[i] + ": 同意\n"
	        		}
	        		else{
	        			document.getElementById("name_label_" + i).innerHTML = that.player_names[i] + ": 反对"
	        			info += that.player_names[i] + ": 反对\n"
	        		}
	        	}
	        	document.getElementById("inner_round_" + inner_round).title = info
	        	if(passed){
	        		document.getElementById("inner_round_" + inner_round).style.backgroundColor = "green"
	        	}
	        	else{
	        		document.getElementById("inner_round_" + inner_round).style.backgroundColor = "red"
	        	}
	        }
        });

        this.socket.on('mission_start', function(group, forced){
        	if(that.state == 2){
        		document.getElementById("status_label").innerHTML = '任务进行中'
        		that.reset_avatar_border();
        		if(forced){
        			that.reset_avatar_name();
        		}
        		for(let i of group){
        			document.getElementById("avatar_button_" + i).style.border = "thick solid blue"
        			document.getElementById("id_label_" + i).innerHTML = "" + (i + 1) + ": 出征中"
        		}
        		if(group.includes(that.player.id)){
        			that.state = 5
    				document.getElementById("mission_buttons").style.display = "flex"
    			}
	        }
        });

        this.socket.on('someone_missioned', function(id) {
        	if(that.state == 2 || that.state == 5){
        		document.getElementById("id_label_" + id).innerHTML = "" + (id + 1) + ": 已出征"
	        }
        });

        this.socket.on('mission_result', function(passed, outer_round, mission_info, leader){
        	if(that.state == 2){
        		if(passed){
	        		document.getElementById("outer_round_" + outer_round).style.backgroundColor = "green"
	        	}
	        	else{
	        		document.getElementById("outer_round_" + outer_round).style.backgroundColor = "red"
	        	}
	        	document.getElementById("outer_round_" + outer_round).title = mission_info
	        	
	        	that.reset_avatar_id()
	        	that.reset_avatar_name()
	        	document.getElementById("id_label_" + leader).innerHTML = "" + (leader + 1) + ": 队长"

	        	if(that.player.id == (leader - 1 + that.count_player) % that.count_player){
        			document.getElementById("speaking_done_button").style.display = "block";
        		}
        		document.getElementById("name_label_" + (leader - 1 + that.count_player) % that.count_player).innerHTML = that.player_names[(leader - 1 + that.count_player) % that.count_player] + ": 发言"
        		document.getElementById("avatar_button_" + (leader - 1 + that.count_player) % that.count_player).style.outline = "thick solid yellow"
        		document.getElementById("status_label").innerHTML = '发言中'
    			// document.getElementById("mission_history").innerHTML += mission_info
    			// that.set_outer_round(outer_round)
	        }
        });

        this.socket.on('speaking_start', function(id){
        	if(that.state == 2){
        		if(that.player.id == id){
        			document.getElementById("speaking_done_button").style.display = "block";
        		}
        		that.reset_avatar_name()
        		document.getElementById("name_label_" + id).innerHTML = that.player_names[id] + ": 发言"
        		document.getElementById("avatar_button_" + id).style.outline = "thick solid yellow"
        	}
        });

        this.socket.on('kill_start', function(){
        	that.reset_avatar_name()
        	that.reset_avatar_border()
        	that.reset_avatar_id()
        	document.getElementById("speaking_done_button").style.display = "none";
        	if(that.state == 2){
        		document.getElementById("status_label").innerHTML = '坏人刺杀中'
        		if(that.player.role == "刺客"){
        			that.state = 3
        		}
	        }
        });

        this.socket.on('win',function(roles){
        	if(that.state == 0){
        		that.init()
        	}
        	else{
	        	that.reset_avatar_name()
	        	that.reset_avatar_border()
	        	that.reset_avatar_id()
	        	document.getElementById("speaking_done_button").style.display = "none";
        		document.getElementById("status_label").innerHTML = '游戏结束'
	        	for(let i = 0; i < roles.length; i++){
	        		that.set_role(roles[i], i)
	        	}
	        	document.getElementById("result_wrapper").style.display = "block"
	    		document.getElementById("kill_info").textContent = "刺杀失败"
	        	if(that.player.role == "刺客" || that.player.role == "莫甘娜"){
	    			document.getElementById("result_info").textContent = "胜败乃兵家常事，大侠请重新来过"
	        	}
	        	else{
	    			document.getElementById("result_info").textContent = "恭喜获得胜利"
	        	}
	        }
        });

        this.socket.on('lost',function(roles, flag){
        	if(that.state == 0){
        		that.init()
        	}
        	else{
    			that.reset_avatar_name()
	        	that.reset_avatar_border()
	        	that.reset_avatar_id()
	        	document.getElementById("speaking_done_button").style.display = "none";
        		document.getElementById("status_label").innerHTML = '游戏结束'
	        	for(let i = 0; i < roles.length; i++){
	        		that.set_role(roles[i], i)
	        	}
	        	document.getElementById("result_wrapper").style.display = "block"
	        	if(flag == true){
	        		document.getElementById("kill_info").textContent = "刺杀成功"
	        	}
	        	else{
	        		document.getElementById("kill_info").textContent = ""
	        	}
	        	if(that.player.role == "刺客" || that.player.role == "莫甘娜"){
	        		document.getElementById("result_info").textContent = "恭喜获得胜利"
	        	}
	        	else{
	        		document.getElementById("result_info").textContent = "胜败乃兵家常事，大侠请重新来过"
	        	}
	        }
        });

        this.socket.on('draw',function(roles, name){
        	if(that.state == 0){
        		that.init()
        	}
        	else{
	        	for(let i = 0; i < roles.length; i++){
	        		that.set_role(roles[i], i)
	        	}
	        	document.getElementById("result_wrapper").style.display = "block"
	        	
        		document.getElementById("kill_info").textContent = "" + name + " 已断开链接..."
        		document.getElementById("result_info").textContent = "当前游戏结束"
	        }
        });

        this.socket.on('please_wait',function(){
        	document.getElementById('login_wrapper').style.display = 'none'
        	document.getElementById("result_wrapper").style.display = "block"
    		document.getElementById("kill_info").textContent = "游戏进行中..."
        	document.getElementById("result_info").textContent = "请游戏结束后再加入游戏"
        	
        });

        this.init()
        //register done
	}

	init(){
		if(this.player != null){
			delete this.player
		}
		this.player = new Player()
		this.player_names = []
		this.count_player = 0
		this.group_size = 0
		this.picked = new Set()
		this.killing = null
		this.state = 0 
		//0 not connected
		//1 ready
		//2 started
		//3 going to kill meilin
		//4 picking group
		//5 missioning
		//6 voting

		//round rows
    	document.getElementById('outer_round_row').style.display = 'none'
    	document.getElementById('inner_round_row').style.display = 'none'
    	this.clear_inner_round_boxes()
    	this.clear_outer_round_boxes()

    	//buttons
    	document.getElementById('speaking_done_button').style.display = 'none'
    	document.getElementById('confirm_button').style.display = 'none'
    	document.getElementById('mission_buttons').style.display = 'none'
    	document.getElementById('vote_buttons').style.display = 'none'

		document.getElementById("result_wrapper").style.display = "none"

		document.getElementById("player_list").innerHTML = ''
		document.getElementById("status_label").innerHTML = ''
		document.getElementById("roles_label").innerHTML = ''

		document.getElementById('connection_info').textContent = 'Get yourself a nickname';
        document.getElementById('nick_wrapper').style.display = 'block';
        document.getElementById('nickname_input').focus();

    	document.getElementById('login_wrapper').style.display = 'block'

    	this.socket.emit('connect_request');
	}

	generate_player_circle(num){
		let ret = ""
		for(let i = 0; i < num; i++){
			ret += `
			<div class="player_frame" id="player_frame_` + i +`">
				<div><label class="id_label" id="id_label_` + i +`">` + (i + 1) +`</label></div>
				<div><button class="avatar_button" id="avatar_button_` + i + `"></button></div>
				<div><label class="name_label" id="name_label_` + i + `"></label></div>
			</div>
			`
		}
		return ret
	}

	set_player_avatar_positions(num){
		for(let i = 0; i < num; i++){
			let xy = tool.calc_pos_in_circule(170, i, num, 280, 280)
			document.getElementById("player_frame_" + i).style.left = xy[0]
			document.getElementById("player_frame_" + i).style.top = xy[1]
		}
	}

	pick_button_clicked(event){
		let id = parseInt(event.target.id.substring(14))
		console.log( "clicked " + id)
		if(av.picked.has(id) == false){ //button hasnt been clicked
			if(av.picked.size == av.group_size){
				return
			}
			av.picked.add(id)
			event.target.style.border = "thick solid blue"
		}
		else{ //clicked
			av.picked.delete(id)
			event.target.style.border = "thick solid white"
		}
		if(av.picked.size == av.group_size){
			document.getElementById("confirm_button").disabled = false
		}
		else{
			document.getElementById("confirm_button").disabled = true
		}
		
	}

	kill_button_callback(event){
		if(parseInt(event.target.id.substring(14)) != av.killing ){ //button hasnt been clicked
			if(av.killing != null){
				document.getElementById("avatar_button_" + av.killing).style.border = "thick solid white"
			}
			av.killing = parseInt(event.target.id.substring(14))
			event.target.style.border = "thick solid red"
		}
		document.getElementById("confirm_button").disabled = false
		document.getElementById("confirm_button").style.display = "block"

		// av.set_kill_button_display("none")
		// av.socket.emit("kill_done", event.target.id.substring(12))
	}

	avatar_button_callback(event){
		if(av.state == 4){
			//in this state, click avatar to pick group members
			av.pick_button_clicked(event)
		}
		else if(av.state == 3){
			//in this state, click avatar to kill meilin
			av.kill_button_callback(event)
		}
	}

	confirm_button_callback(event){
		if(av.state == 4){
			event.target.disabled = true
			event.target.style.display = "none"
			av.state = 2	
			//in this state, click avatar to pick group members
			let picked = []
			av.picked.forEach(function(value) {
			  picked.push(value)
			})
			av.socket.emit('group_picked', picked);
			av.picked = new Set();
		}
		else if(av.state == 3){
			//in this state, click avatar to kill meilin
			av.state = 2
			av.socket.emit("kill_done", av.killing)
		}
		console.log("clicked confirm")
	}

	speaking_done_button_callback(event){
		event.target.style.display = "none"
		av.socket.emit("speaking_done", av.player.id)
	}

	clear_outer_round_boxes(){
		for(let i = 0; i < 5; i++){
			document.getElementById("outer_round_" + i).style.backgroundColor = "transparent"
			document.getElementById("outer_round_" + i).title = ""
		}
	}

	clear_inner_round_boxes(){
		for(let i = 0; i < 5; i++){
			document.getElementById("inner_round_" + i).style.backgroundColor = "transparent"
			document.getElementById("inner_round_" + i).title = ""
		}
	}

	reset_avatar_border(){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("avatar_button_" + i).style.border = "thick solid white"
		}
	}

	reset_avatar_id(){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("id_label_" + i).innerHTML = "" + (i + 1)
		}
	}

	reset_avatar_name(){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("name_label_" + i).innerHTML = this.player_names[i]
			document.getElementById("avatar_button_" + i).style.outlineStyle = "none"
		}
	}

	set_avatar_size(){
		let a = -1/12
		let b = 3/2
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("avatar_button_" + i).style.height = "" + (140 * (a * this.count_player + b)) + "px"
			document.getElementById("avatar_button_" + i).style.width = "" + (120 * (a * this.count_player + b)) + "px"
		}
	}


	set_role(role, id){
		document.getElementById("avatar_button_" + id).style.backgroundPosition = "95% 10%"
    	document.getElementById("avatar_button_" + id).style.backgroundSize = "120% 137%"
    	if(role == "刺客"){
    		document.getElementById("avatar_button_" + id).style.backgroundImage = "url('../img/cike.png')"
    	}
    	else if(role == "莫甘娜"){
    		document.getElementById("avatar_button_" + id).style.backgroundImage = "url('../img/moganna.png')"
    	}
    	else if(role == "梅林"){
    		document.getElementById("avatar_button_" + id).style.backgroundImage = "url('../img/meilin.png')"
    	}
    	else if(role == "派西"){
    		document.getElementById("avatar_button_" + id).style.backgroundImage = "url('../img/paixi.png')"
    	}
    	else if(role == "莫德雷德"){
    		document.getElementById("avatar_button_" + id).style.backgroundImage = "url('../img/modeleide.png')"
    	}
    	else if(role == "奥伯伦"){
    		document.getElementById("avatar_button_" + id).style.backgroundImage = "url('../img/aobolun.png')"
    	}
    	else if(role == "平民"){
    		document.getElementById("avatar_button_" + id).style.backgroundImage = "url('../img/pingmin.png')"
    	}
    	else if(role == "坏人"){
    		document.getElementById("avatar_button_" + id).style.backgroundImage = "url('../img/huairen.png')"
    	}
	}
}