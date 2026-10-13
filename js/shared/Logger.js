/** Shared, dependency-free logging service. Not a Caller and not a Core dependency. */
export const LOG_LEVELS = Object.freeze({debug:10,info:20,warn:30,error:40,silent:Infinity});
const names=["debug","info","warn","error"];
export class Logger {
  constructor({level="info",sink=globalThis.console,prefix="",enabled=true}={}){
    this.sink=sink;this.prefix=String(prefix);this.enabled=Boolean(enabled);
    this.setLevel(level);
  }
  setLevel(level){
    if(!Object.hasOwn(LOG_LEVELS,level))throw new RangeError("Unknown log level: "+level);
    this.level=level;return this;
  }
  setEnabled(enabled){this.enabled=Boolean(enabled);return this;}
  log(level,...args){
    if(!Object.hasOwn(LOG_LEVELS,level)||level==="silent")throw new RangeError("Invalid log level");
    if(!this.enabled||LOG_LEVELS[level]<LOG_LEVELS[this.level])return false;
    const method=typeof this.sink?.[level]==="function"?this.sink[level]:
      (typeof this.sink?.log==="function"?this.sink.log:null);
    if(!method)return false;
    method.apply(this.sink,this.prefix?[`[${this.prefix}]`,...args]:args);
    return true;
  }
  debug(...args){return this.log("debug",...args);}
  info(...args){return this.log("info",...args);}
  warn(...args){return this.log("warn",...args);}
  error(...args){return this.log("error",...args);}
  child(scope){
    const suffix=String(scope).trim();
    if(!suffix)throw new TypeError("Logger scope must be non-empty");
    return new Logger({level:this.level,sink:this.sink,prefix:this.prefix?this.prefix+":"+suffix:suffix,enabled:this.enabled});
  }
}
export const logger=new Logger({prefix:"LumaJS",level:"info"});
