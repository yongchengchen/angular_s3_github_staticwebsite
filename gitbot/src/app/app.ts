//<reference path="node.d.ts" />

import { Singleton } from './lib/interfaces';
import { Helper } from './lib/helper';
import * as https from "https";

export class App extends Singleton{
    private baseUrl = 'https://api.github.com';
    
    public fetch(directory?:string) {

    }
    
}