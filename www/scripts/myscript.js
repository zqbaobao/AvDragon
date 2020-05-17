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

		// document.getElementById("player_list").innerHTML = that.generate_player_circle(10)
		// that.set_player_avatar_positions(10)
		// return
		this.socket = io.connect()

		//register button behaviors
		document.getElementById('ready_button').addEventListener('click', function() {
			if(that.state == 0){
				console.log("clicked ready")
				let nick_name = document.getElementById('nickname_input').value;
				let room_name = document.getElementById('room_input').value;

				if (nick_name.trim().length != 0 && room_name.trim().length != 0) {
					that.player.name = nick_name
					document.getElementById('nickname_input').placeholder = nick_name.trim()
					document.getElementById('room_input').placeholder = room_name.trim()
					that.state = 1
					console.log(nick_name.trim())
					console.log(room_name.trim())
					that.socket.emit('ready_request', nick_name.trim(), room_name.trim());
			    } else {
			        document.getElementById('nickname_input').focus();
			    };
			}
		}, false)

		document.getElementById('start_button').addEventListener('click', function() {
			if(that.state == 1){
				console.log("clicked start")
				that.socket.emit('start_request')
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

        this.socket.on('update_ready_info', function(count_connected, count_ready, names, room_name) {
        	if(that.state == 1){
	        	let info = "Welcome " + that.player.name + "<br><br>Room ID: " + room_name + "<br>Connected: " + count_connected + "<br>Ready: " + count_ready + "<br>Players: " + names + "<br><br>Click Start to start the game with 6, 7, 8 or 9 players"
	        	document.getElementById('connection_info').innerHTML = info;
	        	document.getElementById('nick_wrapper').style.display = 'none';
	        	document.getElementById('start_button_wrapper').style.display = 'inline-block';
	        }
        });

        this.socket.on('game_start', function(my_role, my_id, my_thumbs, names, group_sizes, huxian) {
        	if(that.state == 1){
	        	//hide login wrapper
	        	document.getElementById('login_wrapper').style.display = 'none'

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

	        	//show huxian
	        	if(huxian != -1){
	        		document.getElementById("huxian_img_" + huxian).style.display = "block"
	        	}

	        	//set group size requirements
	        	for(let i = 0; i < 5; i++){
	        		document.getElementById("outer_round_" + i).innerHTML = group_sizes[i]
	        	}

	        	//show round rows
	        	document.getElementById('outer_round_row').style.display = 'flex'
	        	document.getElementById('inner_round_row').style.display = 'flex'
	        	if(that.count_player  == 6){
		        	document.getElementById('roles_label').innerHTML = '游戏配置：6人，梅林、派西维尔、忠臣*2 vs 莫甘娜、刺客，第四轮只需一张坏票'
		        }
		        else if(that.count_player  == 7){
		        	document.getElementById('roles_label').innerHTML = '游戏配置：7人，梅林、派西维尔、忠臣*2 vs 莫甘娜、奥伯伦、刺客，第四轮需要两张坏票'
		        }
		        else if(that.count_player  == 8){
		        	document.getElementById('roles_label').innerHTML = '游戏配置：8人，梅林、派西维尔、忠臣*3 vs 莫甘娜、刺客、爪牙，第四轮需要两张坏票'
		        }
		        else if(that.count_player  == 9){
		        	document.getElementById('roles_label').innerHTML = '游戏配置：9人，梅林、派西维尔、忠臣*4 vs 莫德雷德、莫甘娜、刺客，第四轮需要两张坏票'
		        }
		        else if(that.count_player  == 10){
		        	document.getElementById('roles_label').innerHTML = '游戏配置：10人，梅林、派西维尔、忠臣*4 vs 莫德雷德、莫甘娜、刺客、奥伯伦，第四轮需要两张坏票'
		        }

	        	document.getElementById('roles_label').innerHTML += '<br><br>其他说明：1）鼠标移动至圆圈上方，将显示此轮任务或投票信息 2）点击玩家卡牌以选人<br><br><br><br>'
	        	//set state to game started
	        	that.state = 2
	        	that.socket.emit("started")
	        }
        });

        this.socket.on('pick_group', function(leader, group_size, inner_round) {
        	if(that.state == 2){
        		document.getElementById("status_label").innerHTML = '组队中, 队长: ' + that.player_names[leader]
        		if(inner_round == 0){
        			//clear the old color of last outer round for all inner round boxes
        			that.clear_inner_round_boxes()
        			that.reset_avatar_id();
        			that.reset_avatar_name();
        		}

        		that.reset_avatar_border();
        		document.getElementById("id_label_" + (leader + that.count_player - 1) % that.count_player).innerHTML = "" + ((leader + that.count_player - 1) % that.count_player + 1)
        		document.getElementById("id_label_" + leader).innerHTML = "" + (leader + 1) + ": 队长"
        		document.getElementById("player_frame_" + leader).style.outline = "thick solid yellow"

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
        		let count_agree = 0
        		let count_disagree = 0
	        	for(let i = 0; i < that.count_player; i++){
	        		if(vote_result[i] == true){
	        			document.getElementById("name_label_" + i).innerHTML = that.player_names[i] + ": 同意"
	        			info += that.player_names[i] + ": 同意\n"
	        			count_agree ++;
	        		}
	        		else{
	        			document.getElementById("name_label_" + i).innerHTML = that.player_names[i] + ": 反对"
	        			info += that.player_names[i] + ": 反对\n"
	        			count_disagree ++;
	        		}
	        	}
	        	info += "\n"
	        	info += "同意: " + count_agree + "\n"
	        	info += "反对: " + count_disagree + "\n"
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

	        	// in the past, the player directly starts speaking, now, needs to wait the speaking start signal
	        	// if(that.player.id == (leader - 1 + that.count_player) % that.count_player){
        		// 	document.getElementById("speaking_done_button").style.display = "block";
        		// }
        		// document.getElementById("name_label_" + (leader - 1 + that.count_player) % that.count_player).innerHTML = that.player_names[(leader - 1 + that.count_player) % that.count_player] + ": 发言"
        		// document.getElementById("avatar_button_" + (leader - 1 + that.count_player) % that.count_player).style.outline = "thick solid yellow"
        		// document.getElementById("status_label").innerHTML = '发言中, 发言玩家: ' + that.player_names[(leader - 1 + that.count_player) % that.count_player]
	        }
        });

        this.socket.on('huxian_start', function(id){
        	if(that.state == 2){
        		if(that.player.id == id){
        			that.state = 7
        		}
        		that.reset_avatar_name()
        		document.getElementById("status_label").innerHTML = '验人中, 湖中仙子: ' + that.player_names[id]
    			document.getElementById("player_frame_" + id).style.outline = "thick solid pink"
        	}	
        })

        this.socket.on('check_done', function(is_good, old_huxian, new_huxian){
        	if(that.state == 2){
        		that.clear_is_good_img()
        		that.clear_huxian_img()
        		document.getElementById("huxian_img_" + new_huxian).style.display = "block"
        		if(that.player.id == old_huxian){
        			document.getElementById("is_good_img_" + new_huxian).style.display = "block"
        			if(is_good == true){
						document.getElementById("is_good_img_" + new_huxian).src = "../img/thumb.png";
        			}
        			else{
        				document.getElementById("is_good_img_" + new_huxian).src = "../img/thumb_down.png";
        			}
        		}
        	}	
        })

        this.socket.on('speaking_start', function(id){
        	if(that.state == 2){
        		if(that.player.id == id){
        			document.getElementById("speaking_done_button").style.display = "block";
        		}
        		that.reset_avatar_name()
        		document.getElementById("name_label_" + id).innerHTML = that.player_names[id] + ": 发言"
        		document.getElementById("avatar_button_" + id).style.outline = "thick solid yellow"

        		document.getElementById("status_label").innerHTML = '发言中, 发言玩家: ' + that.player_names[id]
        	}
        });

        this.socket.on('kill_start', function(bad_guys){
        	that.reset_avatar_name()
        	that.reset_avatar_border()
        	that.reset_avatar_id()
        	document.getElementById("speaking_done_button").style.display = "none";

        	if(that.state == 2){
	        	for(let id in bad_guys){
	    			that.set_role(bad_guys[id], id)
	        	}
        		document.getElementById("status_label").innerHTML = '坏人刺杀中'
        		if(that.player.role == "刺客"){
        			document.getElementById("status_label").innerHTML = ', 选择卡牌刺杀'

					document.getElementById("confirm_button").disabled = true
					document.getElementById("confirm_button").style.display = "block"
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
	        	if(that.player.role == "刺客" || that.player.role == "莫甘娜" || that.player.role == "坏人" || that.player.role == "奥伯伦" || that.player.role == "莫德雷德"){
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
	        	if(that.player.role == "刺客" || that.player.role == "莫甘娜" || that.player.role == "坏人" || that.player.role == "奥伯伦" || that.player.role == "莫德雷德"){
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
		this.checked = null
		this.killing = null
		this.state = 0 
		//0 not connected
		//1 ready
		//2 started
		//3 going to kill meilin
		//4 picking group
		//5 missioning
		//6 voting
		//6 huxian checking

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

		document.getElementById('connection_info').textContent = 'Get yourself a nick name and enter the room id';
        document.getElementById('nick_wrapper').style.display = 'block';
        document.getElementById('nickname_input').focus();
        document.getElementById('start_button_wrapper').style.display = 'none';

    	document.getElementById('login_wrapper').style.display = 'block'


    	// this.socket.emit('connect_request');
	}

	generate_player_circle(num){
		let ret = ""
		for(let i = 0; i < num; i++){
			ret += `
			<div class="player_frame" id="player_frame_` + i +`">
				<div style="text-align:center; white-space:nowrap; width: 120px;">
					<div><label class="id_label" id="id_label_` + i +`">` + (i + 1) +`</label></div>
					<div><button class="avatar_button" id="avatar_button_` + i + `"></button></div>
					<div><label class="name_label" id="name_label_` + i + `"></label></div>
				</div>
				<div style="margin-top:27px;display:block">
					<image style="display:none" id="is_good_img_` + i + `" src="../img/thumb_down.png" width="40px" height="40px">
					<image style="display:none" id="huxian_img_` + i + `" src="../img/huxian.png" width="40px" height="55px">
				</div>
			</div>
			`
		}
		return ret
	}

	set_player_avatar_positions(num){
		for(let i = 0; i < num; i++){
			let xy = tool.calc_pos_in_circule(170, i, num, 395, 310 + (num-6)*7)
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

	check_button_callback(event){
		if(parseInt(event.target.id.substring(14)) != av.checked ){ //button hasnt been clicked
			if(av.checked != null){
				document.getElementById("avatar_button_" + av.checked).style.outlineStyle = "none"
			}
			av.checked = parseInt(event.target.id.substring(14))
			event.target.style.outline = "thick solid pink"
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
		else if(av.state == 7){
			av.check_button_callback(event)
		}
	}

	confirm_button_callback(event){

		event.target.disabled = true
		event.target.style.display = "none"
		if(av.state == 4){
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
		else if(av.state == 7){
			av.state = 2
			av.socket.emit("huxian_done", av.checked)
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

	clear_huxian_img(){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("huxian_img_" + i).style.display = "none"
		}
	}

	clear_is_good_img(){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("is_good_img_" + i).style.display = "none"
		}
	}

	reset_avatar_border(){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("avatar_button_" + i).style.border = "thick solid white"
    		document.getElementById("player_frame_" + i).style.outlineStyle = "none"
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