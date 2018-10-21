/* eslint-disable */
import test from 'ava';
import puppeteerHelper from './_puppeteer';
import './_pock';

/* global tinyjx */

const sleep = time => new Promise(rs => setTimeout(rs, time));
const isObj = o => Object.prototype.toString.call(o) === '[object Object]';