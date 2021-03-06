var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server, {
        pingInterval: 2000,
        pingTimeout: 90000,
        upgradeTimeout: 100000
    })
app.use('/', express.static(__dirname + '/www'))
const port = process.env.PORT || 3000
server.listen(port)

var all_sockets = io.sockets.sockets
function count_sockets(room_name){
    let room = io.sockets.adapter.rooms[room_name];
    if(room === undefined){
        return 0
    }
    else{
        return room.length;
    }
}

var socket2player = {}

class Rules{
    constructor(){
        this.thumbs = {
            6: {
                "梅林": ["刺客", "莫甘娜"],
                "派西": ["梅林", "莫甘娜"],
                "莫甘娜": ["刺客"],
                "刺客": ["莫甘娜"]
            },
            7: {
                "梅林": ["刺客", "莫甘娜", "奥伯伦"],
                "派西": ["梅林", "莫甘娜"],
                "莫甘娜": ["刺客"],
                "刺客": ["莫甘娜"]
            },
            8: {
                "梅林": ["刺客", "莫甘娜", "坏人"],
                "派西": ["梅林", "莫甘娜"],
                "莫甘娜": ["刺客", "坏人"],
                "刺客": ["莫甘娜", "坏人"],
                "坏人": ["刺客", "莫甘娜"]
            },
            9: {
                "梅林": ["刺客", "莫甘娜"],
                "派西": ["梅林", "莫甘娜"],
                "莫甘娜": ["刺客", "莫德雷德"],
                "刺客": ["莫甘娜", "莫德雷德"],
                "莫德雷德": ["刺客", "莫甘娜"]
            },
            10: {
                "梅林": ["刺客", "莫甘娜", "奥伯伦"],
                "派西": ["梅林", "莫甘娜"],
                "莫甘娜": ["刺客", "莫德雷德"],
                "刺客": ["莫甘娜", "莫德雷德"],
                "莫德雷德": ["刺客", "莫甘娜"]
            }
        }

        this.roles = {
            6: ["梅林", "派西", "莫甘娜", "刺客", "平民", "平民"],
            7: ["梅林", "派西", "莫甘娜", "刺客", "平民", "平民", "奥伯伦"],
            8: ["梅林", "派西", "莫甘娜", "刺客", "平民", "平民", "平民", "坏人"],
            9: ["梅林", "派西", "莫甘娜", "刺客", "平民", "平民", "平民", "平民", "莫德雷德"],
            10: ["梅林", "派西", "莫甘娜", "刺客", "平民", "平民", "平民", "平民", "莫德雷德", "奥伯伦"]
        }

        this.success_needed = {
            6: [2,3,4,3,4],
            7: [2,3,3,3,4],
            8: [3,4,4,4,5],
            9: [3,4,4,4,5],
            10: [3,4,4,4,5]
        }

        this.group_sizes = {
            6: [2,3,4,3,4],
            7: [2,3,3,4,4],
            8: [3,4,4,5,5],
            9: [3,4,4,5,5],
            10: [3,4,4,5,5]
        }
    }
}
// var rules = new Rules();
// this is the Player class

class Player{
    constructor(socket){
        console.log("created new player")
        this.socket = socket
        this.init()
        this.room_name = ""
    }

    init(){
        this.name = null
        this.role = null
        this.array_index = -1
        this.agree = null
        this.success = null

        if(this.room_name != ""){
            this.socket.leave(this.room_name)
        }
        this.room_name = ""
    }

    signal_game_start(){
        let thumbs = {}
        let names = rooms[this.room_name].get_all_player_names()
        let game_controller = rooms[this.room_name]
        //real code
        if(this.role != "平民" && this.role != "奥伯伦"){
            for(let role of game_controller.rules.thumbs[game_controller.players.length][this.role]){
                let player = rooms[this.room_name].role2player[role]
                thumbs[player.array_index] = role
            }
        }
        let huxian = -1
        if(rooms[this.room_name].players.length == 10){
            huxian = rooms[this.room_name].huxian
        }
        this.socket.emit("game_start", this.role, this.array_index, thumbs, names, rooms[this.room_name].group_sizes, huxian)

        // old hardcoded rule for 6 players
        // if(this.role == "梅林"){
        //     let MoGanNa = game_controller.role2player["莫甘娜"]
        //     let CiKe = game_controller.role2player["刺客"]
        //     thumbs += MoGanNa.array_index + " " + CiKe.array_index
        //     this.socket.emit("game_start", this.role, this.array_index, thumbs, names, game_controller.group_sizes)
        // }
        // else if(this.role == "派西"){
        //     let MoGanNa = game_controller.role2player["莫甘娜"]
        //     let MeiLin = game_controller.role2player["梅林"]
        //     thumbs += MoGanNa.array_index + " " + MeiLin.array_index
        //     this.socket.emit("game_start", this.role, this.array_index, thumbs, names, game_controller.group_sizes)
        // }
        // else if(this.role == "莫甘娜"){
        //     let CiKe = game_controller.role2player["刺客"]
        //     thumbs += CiKe.array_index
        //     this.socket.emit("game_start", this.role, this.array_index, thumbs, names, game_controller.group_sizes)
        // }
        // else if(this.role == "刺客"){
        //     let MoGanNa = game_controller.role2player["莫甘娜"]
        //     thumbs += MoGanNa.array_index
        //     this.socket.emit("game_start", this.role, this.array_index, thumbs, names, game_controller.group_sizes)
        // }
        // else{
        //     this.socket.emit("game_start", this.role, this.array_index, thumbs, names, game_controller.group_sizes)
        // }
    }
}

class Game_Controller{
    constructor(room_name){
        this.init()
        this.rules = new Rules()
        this.room_name = room_name
    }

    init(){
        //setting info
        this.success_needed = []
        this.group_sizes = []
        this.roles = []
        if(this.players != null){
            for(let player of this.players){
                player.init()
            }
        }
        this.players = [] //contains the ready players
        this.role2player = {}

        //counters
        this.count_started = 0
        this.count_voted = 0
        this.count_missioned = 0
        this.count_wins = 0
        //inner round info
        this.leader = null
        this.inner_round = 0
        this.mission_group = []

        //outer round info
        this.huxian = null
        this.outer_round = 0
        this.wins = 0

        /*game stage info
        /*
        0: somebody not ready or players not enough
        1: started
        other stages are removed since they are not used
        */
        this.game_stage = 0
    }

    shuffle_roles(){
        for(let i = this.roles.length - 1; i > 0; i --){
            const j = Math.floor(Math.random() * i)
            const temp = this.roles[i]
            this.roles[i] = this.roles[j]
            this.roles[j] = temp
        }
    }

    assign_roles(){
        for(let i = 0; i < this.players.length; i++){
            this.players[i].role = this.roles[i]
            this.role2player[this.roles[i]] = this.players[i]
        }
    }

    remove_player(player){
        this.players.splice(player.array_index, 1)
        this.update_rest_players_index();
    }

    update_rest_players_index() {
        for(let i = 0; i < this.players.length; i++) {
            if (this.players[i].array_index != i) {
                this.players[i].array_index = i;
            }
        }
    }

    add_player(player){
        player.array_index = this.players.length;
        this.players.push(player)
    }

    signal_game_start(){
        this.game_stage = 1;
        //elect a leader first
        this.leader = Math.floor(Math.random() * this.players.length)
        this.huxian = (this.leader + this.players.length - 1) % this.players.length
        for(const player of this.players){
            player.signal_game_start()
        }
    }

    signal_pick_group(){
        io.to(this.room_name).emit("pick_group", this.leader, this.group_sizes[this.outer_round], this.inner_round)
        this.leader = (this.leader + 1) % this.players.length
    }

    signal_vote(group){
        io.to(this.room_name).emit("vote", group)
    }

    signal_group_info(group){
        io.to(this.room_name).emit("group_info", group)
    }

    signal_mission_start(forced){

        let group = []
        for(let player of this.mission_group){
            group.push(player.array_index)
        }
        io.to(this.room_name).emit("mission_start", group, forced)
    }

    signal_update_ready_info(){
        io.to(this.room_name).emit('update_ready_info', count_sockets(this.room_name), this.players.length, this.get_all_player_names(), this.room_name)
    }

    signal_huxian_start(){
        io.to(this.room_name).emit("huxian_start", this.huxian)
    }

    handle_vote_result(){
        this.count_voted = 0
        let count_agree = 0
        let vote_result = []
        this.players.forEach(
            (player)=>{vote_result.push(player.agree)}
        )

        for(let player of this.players){
            if(player.agree == true){
                count_agree++
            }
            player.agree = null
        }

        if(count_agree > this.players.length / 2){

            io.to(this.room_name).emit("vote_result", true, this.inner_round, vote_result)
            this.signal_mission_start(false)
        }
        else{

            io.to(this.room_name).emit("vote_result", false, this.inner_round, vote_result)

            this.inner_round++
            this.mission_group = []

            this.signal_pick_group()
        }
    }

    handle_mission_result(){
        this.count_missioned = 0
        let count_success = 0

        for(let player of this.mission_group){
            if(player.success == true){
                count_success++
            }
            player.success = null
        }

        let win_flag = (count_success >= this.success_needed[this.outer_round])
        if(win_flag == true){
            this.count_wins++
        }

        let mission_info = ""
        if(win_flag == true){
            mission_info += "任务成功！\n";
        }
        else{
            mission_info += "任务失败！\n";
        }

        mission_info += "Success : " + count_success + "    ";
        mission_info += "Failure : " + (this.mission_group.length - count_success) + "\n";
        mission_info += "队长 : " + this.players[(this.leader + this.players.length - 1) % this.players.length].name + "\n"
        mission_info += "队员 : "
        this.mission_group.forEach(
            (player)=>{mission_info += player.name + " "}
        )
        mission_info += "\n"

        io.to(this.room_name).emit("mission_result", win_flag, this.outer_round, mission_info, (this.leader + this.players.length - 1) % this.players.length)

        if(this.count_wins == 3){
            let bad_guys = {}
            for(let player of this.players){
                let role = player.role
                if(role == "刺客" || role == "莫甘娜" || role == "坏人" || role == "奥伯伦" || role == "莫德雷德"){
                    bad_guys[player.array_index] = role
                }
            }
            io.to(this.room_name).emit("kill_start", bad_guys)
            return
        }
        if(this.outer_round + 1 - this.count_wins == 3){

            io.to(this.room_name).emit("lost", this.roles, false)
            this.init()
            return
        }

        if(this.players.length == 10 && this.outer_round >= 1){
            //for huxian
            this.signal_huxian_start()
        }
        else{
            io.to(this.room_name).emit("speaking_start", (this.leader + this.players.length - 2) % this.players.length)
        }

        this.mission_group = []
        this.inner_round = 0
        this.outer_round++
    }

    handle_lost(){
        io.to(this.room_name).emit("lost", this.roles, true)
        this.init()
    }

    handle_win(){
        io.to(this.room_name).emit("win", this.roles)
        this.init()
    }

    handle_draw(name){
        io.to(this.room_name).emit("draw", this.roles, name)
        this.init()
    }

    get_all_player_names(){
        let group = []
        this.players.forEach(
            (player)=>{group.push(player.name)}
        )
        return group
    }

    get_all_roles(){
        return this.roles
    }

}


var rooms = {}

// var game_controller = new Game_Controller()


io.on('connection', function(socket) {

    let player = new Player(socket)
    console.log("new connection from " + socket.id)
    socket2player[socket.id] = player //currently useless


    // now we use rooms, this becomes useless
    // socket.on('connect_request', function() {
    //     console.log("new connection request")
    //     // for(let skt of Object.keys(all_sockets)){
    //     //     console.log(skt)
    //     // }
    //     if(game_controller.game_stage == 0){
    //         console.log("connected = " + count_sockets())
    //         game_controller.signal_update_ready_info()
    //     }
    //     else{
    //         console.log("connected while game started, connected = " + count_sockets())
    //         socket.emit("please_wait")
    //     }
    //     console.log(" ")
    // })

    socket.on('ready_request', function(name, room_name) {

        if(!(room_name in rooms)){
            rooms[room_name] = new Game_Controller(room_name)
        }
        let game_controller = rooms[room_name]
        

        if(game_controller.game_stage != 0){
            console.log("ready while game started, connected = " + count_sockets(room_name))
            socket.emit("please_wait")
            return
        }
        console.log("player " + name + " is now in room " + room_name )
        player.name = name
        player.room_name = room_name
        socket.join(room_name)

        game_controller.add_player(player)
        console.log("ready players: " + game_controller.get_all_player_names())

        game_controller.signal_update_ready_info()

    })

    socket.on('start_request', function(){
        let game_controller = rooms[player.room_name]
        if(player.room_name == "" || game_controller.game_stage != 0){
            return
        }
        if(game_controller.players.length >= 6 && game_controller.players.length <= 10){
            //init rules for this game
            game_controller.roles = game_controller.rules.roles[game_controller.players.length]
            game_controller.success_needed = game_controller.rules.success_needed[game_controller.players.length]
            game_controller.group_sizes = game_controller.rules.group_sizes[game_controller.players.length]

            game_controller.shuffle_roles()
            game_controller.assign_roles()

            console.log("\ngame starts")
            console.log(game_controller.get_all_player_names())
            console.log(game_controller.get_all_roles())
            console.log(game_controller.players.length)
            console.log(" ")

            game_controller.signal_game_start()
        }
    })

    socket.on('started', function() {

        let game_controller = rooms[player.room_name]
        if(player.room_name == "" || game_controller.game_stage != 1){
            return
        }

        game_controller.count_started++
        if(game_controller.count_started == game_controller.players.length){
            game_controller.signal_pick_group()
        }
    })

    socket.on('group_picked', function(group) {

        let game_controller = rooms[player.room_name]
        if(player.room_name == "" || game_controller.game_stage != 1){
            return
        }

        for(let i of group){
            game_controller.mission_group.push(game_controller.players[i])

        }

        if(game_controller.inner_round == 4){
            game_controller.signal_mission_start(true)
        }
        else{
            game_controller.signal_vote(group)
        }

    })

    socket.on('vote_done', function(vote) {

        let game_controller = rooms[player.room_name]
        if(player.room_name == "" || game_controller.game_stage != 1){
            return
        }

        io.to(player.room_name).emit("someone_voted", player.array_index)
        if(vote == "agree"){
            player.agree = true
        }
        else{
            player.agree = false;
        }
        game_controller.count_voted++
        if(game_controller.count_voted == game_controller.players.length){

                game_controller.handle_vote_result()
        }
    })

    socket.on('huxian_done', function(id_picked){
        let game_controller = rooms[player.room_name]
        if(player.room_name == "" || game_controller.game_stage != 1){
            return
        }

        let role = game_controller.players[id_picked].role
        if(role == "刺客" || role == "莫甘娜" || role == "坏人" || role == "奥伯伦" || role == "莫德雷德"){
            io.to(player.room_name).emit("check_done", false, player.array_index, id_picked)
        }
        else{
            io.to(player.room_name).emit("check_done", true, player.array_index, id_picked)
        }
        game_controller.huxian = id_picked
        io.to(player.room_name).emit("speaking_start", (game_controller.leader + game_controller.players.length - 2) % game_controller.players.length)
    })

    socket.on('mission_done', function(mission) {

        let game_controller = rooms[player.room_name]
        if(player.room_name == "" || game_controller.game_stage != 1){
            return
        }

        if(mission == "success"){
            player.success = true
        }
        else{
            player.success = false;
        }

        io.to(player.room_name).emit("someone_missioned", player.array_index)
        game_controller.count_missioned++
        if(game_controller.count_missioned == game_controller.mission_group.length){

                game_controller.handle_mission_result()
        }
    })

    socket.on('speaking_done', function(id) {

        let game_controller = rooms[player.room_name]
        if(player.room_name == "" || game_controller.game_stage != 1){
            return
        }

        if(id == (game_controller.leader + game_controller.players.length - 1) % game_controller.players.length){
            game_controller.signal_pick_group()
        }
        else{
            io.to(player.room_name).emit("speaking_start", (id - 1 + game_controller.players.length) % game_controller.players.length)
        }
    })

    socket.on('kill_done', function(id) {

        let game_controller = rooms[player.room_name]
        if(player.room_name == "" || game_controller.game_stage != 1){
            return
        }

        if(game_controller.players[id].role == "梅林"){
            game_controller.handle_lost()
        }
        else{
            game_controller.handle_win()
        }
    })

    socket.on('disconnect', function() {

        let game_controller = rooms[player.room_name]

        console.log("disconnect " + socket.id)
        if(player.room_name == ""){
            return
        }

        // console.log("connected = " + count_sockets(player.room_name))

        if(game_controller.game_stage == 0){

            if(game_controller.players.includes(player)){
                console.log("player " + player.name + " left.")
                game_controller.remove_player(player)
                console.log("remaining players: " + game_controller.get_all_player_names())
            }

            game_controller.signal_update_ready_info()
        }
        else{
            if(game_controller.players.includes(player)){
                console.log("player " + player.name + " left in game.")
                game_controller.handle_draw(player.name)
            }
            else{
                console.log("someone left.")
            }
        }
        // if(count_sockets(player.room_name) == 0){
        //     game_controller.init() //hack for fixing ghost players for now
        // }
    })

})

// app.use(function (req, res, next) {
// 	let ip = req.connection.remoteAddress
// 	console.log('request from : ', ip)
// 	next()
// })
