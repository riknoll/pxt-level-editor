/**
/**
 * Tagged level literal converter
 * 
 * Keep groups in line with identifiers listed in /src/exporter/concrete.ts
 *
 * might need a helper= function for the sim?
 * /
//% shim=@f4 helper=bufferToLevel blockIdentity="levels.level_object"
//% groups=["!","#","$","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","]","^","_","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~","¡","¢","£","¤","¥","¦","§","¨","©","ª","«","¬","®","¯","°","±","²","³","´","µ","¶","·","¸","¹","º","»","¼","½","¾","¿","À","Á","Â","Ã","Ä","Å","Æ","Ç","È","É","Ê","Ë","Ì","Í","Î","Ï","Ð","Ñ","Ò","Ó","Ô","Õ","Ö","×","Ø","Ù","Ú","Û","Ü","Ý","Þ","ß","à","á","â","ã","ä","å","æ","ç","è","é","ê","ë","ì","í","î","ï","ð","ñ","ò","ó","ô","õ","ö","÷","ø","ù","ú","û","ü","ý","þ","ÿ"]
function lvl(lits: any,...args: any[]): LevelImage { return null }


interface LevelImage extends Image {

}
*/
namespace level {
    export class Level {
        protected map: Image;
        /**
        constructor(data: Image) {
        }
        */

        // temporary bad hack just using string literal; convert to just use tagged template above, but that's behaving wonkily at the moment. this won't store data in flash properly
        constructor(data: string) {
            const identifiers = `!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ`;
            const rows = data.split('\n');

            while (!rows[0])
                rows.shift();
            while (!rows[rows.length - 1])
                rows.pop();

            let maxWidth = 0;
            for (let row of rows) {
                maxWidth = Math.max(maxWidth, row.length)
            }

            this.map = image.create(maxWidth, rows.length);
            for (let y = 0; y < rows.length; y++) {
                const row = rows[y];
                for (let x = 0; x < row.length; x++) {
                    const id = identifiers.indexOf(row[x])
                    this.map.setPixel(x, y, id < 0 ? 0 : id);
                }
            }

        }
        // /temporary

        tile(x: number, y: number) {
            const selected = this.map.getPixel(x, y);
            if (selected == undefined)
                return undefined;

            return tiles[selected];
        }
    }

    let tiles: Image[];
    export function registerTile(id: number, i: Image) {
        if (!tiles) tiles = [];
        tiles[id] = i;
    }
}