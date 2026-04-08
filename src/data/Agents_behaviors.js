const state=[

{
       state_id:0,
       Action:"Move (up)",
       Reward:0 // No reward for movement, just changing position
},

{
       state_id:1,
       Action:"Fire left",
       Reward:+1 // Reward given when the shot successfully hits a robbert
},

{
       state_id:2,
       Action:"Move (down right)",
       Reward:-1 // // Penalty for wasting ammo or missing the target
},

{
       state_id:3,
       Action:"Move (left)",
       Reward:0 //Neutral action: no gain or penalty
},

{
       state_id:4,
       Action:"Fire right",
       Reward:+1 // Reward given when the shot successfully hits a robbert
},

{
       state_id:5,
       Action:"Fire",
       Reward:+1 // Reward given when the shot successfully hits a robbert
},

{
       state_id:6,
       Action:"No operation",
       Reward:0 //Neutral action: no gain or penalty
}


]
module.exports=state;