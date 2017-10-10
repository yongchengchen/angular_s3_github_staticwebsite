//<reference path="node.d.ts" />

import { Singleton } from './interfaces';
import * as https from "https";


export class HttpClient extends Singleton {
    private readonly useragent:string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36, Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36, Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
    private plugins:any[] = [];

    public addPlugin(plugin:(options:any)=>any){
        this.plugins.push(plugin)
    }

    private prepareOptions(method:string, url:string, options?:any) {
        url = url.replace('https://', '').replace('http://', '')
        let paths = url.split('/');
        let host:string = paths.shift();
        let path:string = '/' + paths.join('/')
        options = options ? options : {}
        options['host'] = options.host ? options.host : host;
        options['path'] = options.path ? options.path : path;
        options['method'] = method;
        options['headers'] = options.headers ? options.headers : {};
        
        options.headers['user-agent'] = this.useragent;

        for(let plugin of this.plugins) {
            options = plugin(options)
        }
        return options;
    }

    public get(url:string, callback:(err:boolean, resp:string)=>void) {
        // Set up the request
        var req = https.request(this.prepareOptions('GET', url), function(res) {
            let response = ''
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                response += chunk
            });
            res.on('end', function(){
                callback(false, response);
            });
            res.on('error', function(err) {
                callback(true, JSON.stringify(err))
            })
        });
        req.end();
        
    }

    public post(url:string, callback:(err:boolean, resp:string)=>void) {
        // Set up the request
        var req = https.request(this.prepareOptions('POST', url), function(res) {
            let response = ''
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                response += chunk
            });
            res.on('end', function(){
                callback(false, response);
            });
            res.on('error', function(err) {
                callback(true, JSON.stringify(err))
            })
        });
        req.end();
    }




//    https.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', (resp) => {
//      let data = '';
    
//      // A chunk of data has been recieved.
//      resp.on('data', (chunk) => {
//        data += chunk;
//      });
    
//      // The whole response has been received. Print out the result.
//      resp.on('end', () => {
//        console.log(JSON.parse(data).explanation);
//      });
    
//    }).on("error", (err) => {
//      console.log("Error: " + err.message);
//    });
}

