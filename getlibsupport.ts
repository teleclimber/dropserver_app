import type libSupportIface from 'https://deno.land/x/dropserver_lib_support@v0.2.1/mod.ts';

const w = <{["DROPSERVER"]?:libSupportIface}>globalThis;
export default function mustGetLibSupport() :libSupportIface {
	if( w["DROPSERVER"] === undefined ) throw new Error("Dropserver instance not present.");
	return w["DROPSERVER"];
}