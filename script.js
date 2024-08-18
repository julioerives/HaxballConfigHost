const statsAllUsers ={};
const host = HBInit({
	roomName: "Julio Erives ",
	maxPlayers: 16,
	noPlayer: true,
    public:true
});
const messagesShow ={
    normal:0x00FFFB,
    toUser:0x890002,
    danger:0xFF0408
}
let allUsers ={};

let lastlastTouchPlayer=null;
let lastTouchPlayer=null;
host.setDefaultStadium("Big");
host.setScoreLimit(3);
host.setTimeLimit(3);
host.setTeamsLock(false);
host.onPlayerBallKick = function(player) {
    console.log("🚀 ~ player:", player)
    lastlastTouchPlayer = lastTouchPlayer==player? lastlastTouchPlayer:lastTouchPlayer;
    lastTouchPlayer = player;

};
host.onPlayerJoin = function(player) {
    // let userExists;
    host.sendAnnouncement(`Se ha unido ${player.name}`,null,messagesShow.normal,"italic",2)
    console.log(player);
    // userExists = allUsers.filter(element => element.name == player.name);
    // console.log(userExists)
    // if(userExists.length >0){
    //     host.sendAnnouncement("Este usuario ya existe...",player.id,messagesShow.danger,"",2);
    //     host.sendAnnouncement("Este usuario ya existe...",player.id,messagesShow.danger,"",2);
    //     host.sendAnnouncement("Este usuario ya existe...",player.id,messagesShow.danger,"",2);
    //     host.sendAnnouncement("Este usuario ya existe...",player.id,messagesShow.danger,"",2);
    //     host.sendAnnouncement("Este usuario ya existe...",player.id,messagesShow.danger,"",2);
    //     host.sendAnnouncement("Este usuario ya existe...",player.id,messagesShow.danger,"",2);
    //     setTimeout(()=>{
    //         host.kickPlayer(player.id)
    //     },1000)
    // }

    changeIdPlayer(player);
    validarNewUser(player);
    const players=host.getPlayerList();
    console.log("🚀 ~ host.getPlayerList():", host.getPlayerList())
    const teamRed = players.filter(p => p.team === 1);
    const teamBlue = players.filter(p => p.team === 2);
    if(teamRed.length >= 3 || teamBlue.length >= 3)return
    if(players.length % 2 == 0){
        host.setPlayerTeam(players[players.length-2].id,1)
        host.setPlayerTeam(players[players.length-1].id,2)
    }
}
host.onPlayerLeave=function(player){
    const players=host.getPlayerList();
    console.log("Player leave",player)
    playerLeave(getAuthPlayer(player));

    const teamRed = players.filter(p => p.team === 1);
    const teamBlue = players.filter(p => p.team === 2);
    const noTeam = players.filter(p => p.team===0);
    if(player.team == 1 || player.team == 2){
        console.log()
        if (teamRed.length <= teamBlue.length) {
            if(noTeam.length > 0){
                host.setPlayerTeam(noTeam[0].id, 1);
                return
            }
            console.log("Rojo",noTeam);
             host.setPlayerTeam(teamBlue[teamBlue.length-1].id,0)
        } else {
            if(noTeam.length > 0){
                host.setPlayerTeam(noTeam[0].id, 2);
                return
            }
            console.log("Azul",noTeam);
             host.setPlayerTeam(teamRed[teamRed.length-1].id,0)
        }
    }

}
host.onTeamVictory = function(scores) {
    let players = host.getPlayerList();
    
    host.stopGame();

    if (scores.red > scores.blue) {
        players.forEach(element => {
            if (element.team === 2) {
                host.setPlayerTeam(element.id, 0); 
            }
        });
        
        setTimeout(() => {
            let noTeam = host.getPlayerList().filter(element => element.team === 0);
            let teamRed = host.getPlayerList().filter(element => element.team === 1);
            noTeam.slice(0, teamRed.length).forEach(element => {
                host.setPlayerTeam(element.id, 2);
            });
            host.startGame()
        }, 1000);
        
        return
    }
        players.forEach(element => {
            if (element.team === 1) {
                host.setPlayerTeam(element.id, 0);
            }
        });
        
        setTimeout(() => {
            let noTeam = host.getPlayerList().filter(element => element.team === 0);
            let teamBlue = host.getPlayerList().filter(element => element.team === 2);
            noTeam.slice(0, teamBlue.length).forEach(element => {
                host.setPlayerTeam(element.id, 1);
            });
            host.startGame()
        }, 1000);
        
};
host.onTeamGoal= function(team) {
    if(!lastTouchPlayer) return;
    if(team == lastTouchPlayer.team){
        host.sendAnnouncement(`Gol de ${lastTouchPlayer.name}`)
        
        statsAllUsers[getAuthPlayer(lastTouchPlayer)].goles++;
        host.setPlayerAvatar(lastTouchPlayer.id,"⚽")
        setTimeout(()=>{
            host.setPlayerAvatar(lastTouchPlayer.id,null)
        },1500)
        console.log(lastlastTouchPlayer)
        if(lastlastTouchPlayer && (lastTouchPlayer.id != lastlastTouchPlayer.id)){
            statsAllUsers[getAuthPlayer(lastlastTouchPlayer.id)].asistencias++;
            host.setPlayerAvatar(lastlastTouchPlayer.id,"🎯")
            setTimeout(()=>{
                host.setPlayerAvatar(lastlastTouchPlayer.id,null)
            },1500)
        } 
        return
    }
    host.sendAnnouncement(`Gol en propia puerta de ${lastTouchPlayer.name}`)
    statsAllUsers[getAuthPlayer(lastTouchPlayer.id)].golesContra++;
    host.setPlayerAvatar(lastTouchPlayer.id,"💩")
    setTimeout(()=>{
        host.setPlayerAvatar(lastTouchPlayer.id);
    })
    console.log(lastTouchPlayer);
}
host.onPlayerChat= function(player,message) {
    console.log(player)
    const messages = message.split(" ");
    if(!message.startsWith("!")) return true
    if(messages[0] =="!showStats"){
        console.log(statsAllUsers)
        host.sendAnnouncement(`Goles: ${statsAllUsers[player.id].goles} Goles en contra: ${statsAllUsers[player.id].golesContra} Asistencias: ${statsAllUsers[player.id].asistencias}`)
        return false
    }
    if(messages[0]=="!admin"){
        if(messages[1]!="CruzAzul"){
            host.sendAnnouncement("Contrasenia no valida",player.id);
            return false;
        }
        host.setPlayerAdmin(player.id,true);
        host.sendAnnouncement("Ahora eres admin",player.id,messagesShow.toUser,"italic",2);
        host.sendAnnouncement(`El jugador ${player.name} ahora es admin`,null,messagesShow.normal,"italic",2);
        return false
    }
    if(messages[0]=="!me"){
        host.sendAnnouncement(`Goles: ${statsAllUsers[player.id].goles} Goles en contra: ${statsAllUsers[player.id].golesContra}`,player.id,messagesShow.toUser,"italic",2)
    }
}
const validarNewUser=(player)=>{
    if(statsAllUsers[player.auth]) return;
    statsAllUsers[player.auth] = {
        goles:0,
        asistencias:0,
        golesContra:0
    }
}
const changeIdPlayer= (player)=>{
    if(!allUsers[player.auth]){
        allUsers[player.auth] ={
            auth:player.auth,
            id: player.id,
            active: true
        }
        return null;
    };

    console.log("🚀 ~ changeIdPlayer ~ allUsers[player.auth]:", allUsers[player.auth])

    
    if(allUsers[player.auth].active){
        host.kickPlayer(player.id,"No entres 2 veces a la sala, romperas la sala pendejo")
    }
    allUsers[player.auth] = {
        ...allUsers[player.auth],
        id:player.id,
        active:true
    };
    return allUsers[player.auth].auth
}
const getAuthPlayer= (player)=>{
    const dataUser = Object.values(allUsers).map(user => {
        if(user.id = player.id){
            return user
        }
        return null;
    });
    console.log("🚀 ~ getAuthPlayer ~ dataUse:", dataUser)
    return dataUser[0].auth || null;
}
const playerLeave= (auth) => {
    console.log("primer auth",auth)
    console.log(allUsers[auth])
    if(!allUsers[auth]){
        return;
    } 
    console.log("🚀 ~ playerLeave ~ auth:", auth)

    allUsers[auth].active = false;

}