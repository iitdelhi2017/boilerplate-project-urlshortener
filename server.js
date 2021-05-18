require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
var dns=require('dns');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

//-------------------------------------------------------------------------


mongoose.connect("mongodb+srv://user2:user2@cluster0.tcl4l.mongodb.net/myDatabase?retryWrites=true&w=majority"
, { useNewUrlParser: true, useUnifiedTopology: true });


var urlSchema=new mongoose.Schema({
  url:String,
  shorturl:{
    type:Number,
    default:function() {
      return Math.floor(Math.random()*100+Math.random()*10); 
    }
  }
});

app.use(bodyParser.urlencoded({extended:true}));

var urls=mongoose.model('URL',urlSchema);

var create_url=function(req,res){
  console.log(req.body.url);
  var link="";
  if(req.body.url.slice(0,8)!="https://" ){
     res.json({"error":"invalid url"});
      return;
  };
  if(req.body.url.slice(8,12)!="www.")
    link+="www."
  for(var i=8;i<req.body.url.length-1;i++)
    link+=req.body.url[i];
  console.log(link);
  /*dns.lookup(link,function(err,addr){
    console.log(addr);
    if(err) {
      res.json({"error":"invalid url"});
      return;
    };*/
    var URL=new urls({url:req.body.url});
    URL.save(function(err,data){
    if(err) console.error(err);
    res.json({"original_url":data.url,"short_url":data.shorturl});
  });
 // });
};

var use_short=function(req,res){
  if(isNaN(parseInt(req.params.code))){
    res.json('Not found');return;
  };
  urls.findOne({shorturl:parseInt(req.params.code)},function(err,data){
    if(err) console.error(err);
    if(data==undefined) {res.json('NNo short URL found for the given input');return;}
    res.redirect(data.url);
  });
};

app.post('/api/shorturl',create_url);
app.get('/api/shorturl/:code',use_short);
//-----------------------------------------------------------------------------