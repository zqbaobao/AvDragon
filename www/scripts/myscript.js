var av = null
window.onload = function() {
	//实例并初始化我们的hichat程序
	av = new AvLong()
}

class Player{
    constructor(){
        this.name = null
        this.role = null
        this.state = 0
        //0 connected
        //1 ready
        //2 started
        this.id = null
    }
}

class AvLong{
	constructor(){
		var that = this;

		this.socket = io.connect()

		//register button behaviors
		document.getElementById('ready_button').addEventListener('click', function() {
			if(that.player.state == 0){
				let nick_name = document.getElementById('nickname_input').value;

				if (nick_name.trim().length != 0) {
					that.player.name = nick_name
					document.getElementById('nickname_input').placeholder = nick_name
					that.player.state = 1
					that.socket.emit('ready_request', nick_name);
			    } else {
			        document.getElementById('nickname_input').focus();
			    };
			}
		}, false)

		document.getElementById('agree_button').addEventListener('click', function() {
			that.socket.emit('vote_done', 'agree')
			document.getElementById('vote_buttons').style.display = "none"
		}, false)

		document.getElementById('disagree_button').addEventListener('click', function() {
			that.socket.emit('vote_done', 'disagree')
			document.getElementById('vote_buttons').style.display = "none"
		}, false)

		document.getElementById('success_button').addEventListener('click', function() {
			that.socket.emit('mission_done', 'success')
			document.getElementById('mission_buttons').style.display = "none"
		}, false)

		document.getElementById('failure_button').addEventListener('click', function() {
			that.socket.emit('mission_done', 'failure')
			document.getElementById('mission_buttons').style.display = "none"
		}, false)

		document.getElementById('again_button').addEventListener('click', function() {
			document.getElementById('result_wrapper').style.display = "none"
			that.init()
		}, false)
		//register done

		//register socket callbacks
		this.socket.on('connect', function() {
			
        });

        this.socket.on('update_ready_info', function(count_connected, count_ready) {
        	if(that.player.state == 1){
	        	let info = "Welcome " + that.player.name + "<br>Connected: " + count_connected + "<br>Ready: " + count_ready + "<br>Game will start automatically when everyone is ready"
	        	document.getElementById('connection_info').innerHTML = info;
	        	document.getElementById('nick_wrapper').style.display = 'none';
	        }
        });

        this.socket.on('game_start', function(my_role, my_id, my_thumbs, names) {
        	if(that.player.state == 1){

	        	//generate all rows
	        	let name_array = names.split(" ")
	        	that.count_player = name_array.length
	        	document.getElementById("status_log").style.display = "block"
	        	document.getElementById("player_list").innerHTML  = that.generate_info_rows(that.count_player)
	        	for(let i = 0; i < that.count_player; i++){
	        		document.getElementById("p_name_"+i).textContent = name_array[i]
	        		document.getElementById('button_pick_' + i).addEventListener('click', that.pick_button_callback, false)
	        		document.getElementById('button_kill_' + i).addEventListener('click', that.kill_button_callback, false)
	        	}
	        	

	        	//set my role and my visibility
	        	that.player.role = my_role
	        	that.player.id = my_id
	        	document.getElementById("p_role_" + my_id).textContent = my_role
	        	let thumb_array = my_thumbs.split(" ")
	        	for(const thumb of thumb_array){
	        		if(thumb.trim().length != 0){
	        			if(my_role == "刺客" || my_role == "莫甘娜"){
		        			document.getElementById("p_is_thumb_" + thumb).textContent = "队友"
		        		}
	        			else{
	        				document.getElementById("p_is_thumb_" + thumb).textContent = "拇指牌"
	        			}
	        		}
	        	}
	        	document.getElementById('login_wrapper').style.display = 'none'

	        	that.player.state = 2
	        	that.socket.emit("started")
	        }
        });

        this.socket.on('pick_group', function(leader, group_size, inner_round) {
        	if(that.player.state == 2){
        		that.set_inner_round(inner_round)
        		if(inner_round == 0){
        			that.set_text_content("p_is_picked_", "")
        		}
        		document.getElementById("p_is_leader_" + (leader + that.count_player - 1) % that.count_player).textContent = ""
        		document.getElementById("p_is_leader_" + leader).textContent = "队长"
        		

        		if(leader == that.player.id){
        			that.group_size = group_size
        			that.set_pick_button_display("block")
        		}
	        }
        });

        this.socket.on('vote', function(group) {
        	if(that.player.state == 2){
        		that.set_text_content("p_is_picked_","")
        		let id_array = group.split(" ")
        		for(let i of id_array){
        			i = parseInt(i)
        			document.getElementById("p_is_picked_" + i).textContent = "队员"
        		}
        		// that.set_text_content("p_vote_status_","")
        		document.getElementById("vote_buttons").style.display = "flex"
	        }
        });

        this.socket.on('vote_result', function(vote_result){
        	if(that.player.state == 2){
	        	let vote_array = vote_result.split(" ")
	        	for(let i = 0; i < that.count_player; i++){
	        		if(vote_array[i] == "true"){
	        			document.getElementById("p_vote_status_" + i).textContent = "同意"
	        		}
	        		else{
	        			document.getElementById("p_vote_status_" + i).textContent = "反对"
	        		}
	        	}
	        }
        });

        this.socket.on('mission_start', function(group_ids){
        	if(that.player.state == 2){
        		if(group_ids.includes(that.player.id)){
    				document.getElementById("mission_buttons").style.display = "flex"
    			}
    			document.getElementById("p_inner_round").textContent = "任务进行中"
	        }
        });

        this.socket.on('mission_result', function(mission_info, outer_round){
        	if(that.player.state == 2){
    			document.getElementById("mission_history").innerHTML += mission_info
    			that.set_outer_round(outer_round)
	        }
        });

        this.socket.on('group_info', function(group){
        	if(that.player.state == 2){
        		that.set_text_content("p_is_picked_","")
        		let id_array = group.split(" ")
        		for(let i of id_array){
        			i = parseInt(i)
        			document.getElementById("p_is_picked_" + i).textContent = "队员"
        		}
	        }
        });

        this.socket.on('kill_start', function(){
        	if(that.player.state == 2){
        		document.getElementById("p_outer_round").textContent = "坏人刺杀中"
        		document.getElementById("p_inner_round").textContent = "好人暂时胜利"
        		if(that.player.role == "刺客"){
        			that.set_kill_button_display("block")
        		}
	        }
        });

        this.socket.on('win',function(roles){
        	if(that.player.state == 0){
        		that.init()
        	}
        	else{
	        	that.set_roles(roles)
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
        	if(that.player.state == 0){
        		that.init()
        	}
        	else{
	        	that.set_roles(roles)
	        	document.getElementById("result_wrapper").style.display = "block"
	        	if(flag == true){
	        		document.getElementById("kill_info").textContent = "刺杀成功"
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
        	if(that.player.state == 0){
        		that.init()
        	}
        	else{
	        	that.set_roles(roles)
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
		this.count_player = 0
		this.group_size = 0
		this.picked = []

		document.getElementById('p_inner_round').textContent = '第1轮选人'
		document.getElementById('p_outer_round').textContent = '准备第1次任务'
		document.getElementById('status_log').style.display = 'none'
		document.getElementById("result_wrapper").style.display = "none"

		document.getElementById("player_list").innerHTML = ''
		document.getElementById("mission_history").innerHTML = ''

		document.getElementById('connection_info').textContent = 'Get yourself a nickname';
        document.getElementById('nick_wrapper').style.display = 'block';
        document.getElementById('nickname_input').focus();

    	document.getElementById('login_wrapper').style.display = 'block'

    	this.socket.emit('connect_request');
	}

	generate_info_rows(num){
		let ret = ""
		for(let i = 0; i < num; i++){
			ret += `
				<div class="info_row">
					<div><p>` + (i+1) + `</p></div>
					<div><p id=p_name_` + i + `> </p></div>
					<div><p id=p_role_` + i + `> </p></div>
					<div><p id=p_is_thumb_` + i + `> </p></div>
					<div><p id=p_is_leader_` + i + `> </p></div>
					<div><p id=p_is_picked_` + i + `> </p></div>
					<div><p id=p_vote_status_` + i + `> </p></div>
					<div><button id=button_pick_` + i + `>选择</button></div>
					<div><button id=button_kill_` + i + `>刺杀</button></div>
				</div>
			`
		}
		return ret
	}

	set_pick_button_display(property){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("button_pick_" + i).style.display = property
		}
	}

	set_kill_button_display(property){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("button_kill_" + i).style.display = property
		}
	}

	set_text_content(p, content){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById(p + i).textContent = content
		}
	}

	pick_button_callback(event){
		event.target.style.display = "none"
		av.picked.push(event.target.id.substring(12))

		if(av.picked.length == av.group_size){
			let info = ""
			av.picked.forEach((id)=>{info += id + " "})
			av.picked = []
			av.set_pick_button_display("none")
			av.socket.emit('group_picked', info.trim());
		}
	}

	kill_button_callback(event){
		av.set_kill_button_display("none")
		av.socket.emit("kill_done", event.target.id.substring(12))
	}

	set_inner_round(inner_round){
		document.getElementById("p_inner_round").textContent = "第" + (inner_round + 1) + "轮选人"
		if(inner_round == 4){
			document.getElementById("p_inner_round").textContent += ", 强制轮"
		}
	}

	set_outer_round(outer_round){
		document.getElementById("p_outer_round").textContent = "准备第" + (outer_round + 1) + "次任务"
		if(outer_round == 3){
			document.getElementById("p_outer_round").textContent += ", 需要两张fail"
		}
	}

	set_roles(roles){
		for(let i = 0; i < this.count_player; i++){
			document.getElementById("p_role_" + i).textContent = roles[i]
		}
	}
}