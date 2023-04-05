import * as dataDump from '../data.json';
import axios, { AxiosResponse } from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import sleep from 'util';

const batchSize = 4;
let records = new Array<Array<string>>;
let batchCount = 0;

const createBatches = function(urls: any, batchSize: any){

    let numberOfBatches = (urls.length / batchSize) - 1;

    for (let x = 0; x <= Math.ceil(numberOfBatches); x++){
        let batchArray = new Array<any>;
        records.push(batchArray);
    }

}

const fetchStatus = function(url: string): Promise<number>{
    return new Promise(function(resolve){
        axios.get(url).
        then(function(response){
            resolve(response.status);            
        })      
        .catch(function(error){
            resolve(404);
        })
    })
}

const checkStatus = async function(statusList: Array<string>, interval: number){
    
    console.time("url crawl");

    let timer = sleep.promisify(setTimeout);
    let counter = 1;

    for (const statusItem of statusList){
        
        console.time("checkStatus");
        
        let statusRecord = await(fetchStatus(statusItem));
        let statusMessage = `${counter},${statusItem},${statusRecord}`;

        if (records[batchCount].length == batchSize){
            batchCount++;
            records[batchCount].push(statusMessage);
        } else {
            records[batchCount].push(statusMessage);
        } 

        await timer(interval);
        console.timeEnd("checkStatus")
        console.log(`record number ${counter} finished fetch`)
        counter++;

    }
    console.timeEnd('url crawl');



    records.forEach(function(value, index){
        value.forEach(function(value, index){
            syncWriteFile('./example.txt', value);
        })
    });
}

async function syncWriteFile(filename: string, data: any) {
    console.time('write timer')
    writeFileSync(join(__dirname, filename), data + '\n', {
      flag: 'a+',
    });

    console.timeEnd('write timer')
}

//createBatches(dataDump.urls, batchSize);
//checkStatus(dataDump.urls, 300); 