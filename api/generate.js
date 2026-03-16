export default async function handler(req, res) {

const apiKey = process.env.OPENAI_API_KEY;

if(!apiKey){
return res.status(500).json({error:"API key missing"});
}

const { text } = req.body;

const response = await fetch("https://api.openai.com/v1/chat/completions", {

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${apiKey}`
},

body:JSON.stringify({

model:"gpt-4o-mini",

messages:[
{
role:"system",
content:"너는 대한민국 오픈마켓 상품명 가공 전문가다."
},
{
role:"user",
content:text
}
]

})

});

const data = await response.json();

res.status(200).json(data);

}
