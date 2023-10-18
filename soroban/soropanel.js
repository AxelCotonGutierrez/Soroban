// Original: Masao Nakagawa@Shiga University
// Modificado por: Masaaki Murakami (masaaki.murakai@gmail.com)
// Modificado de nuevo para España: Axel Cotón Gutiérrez
// mv(name) : Movimiento de las cuentas.  name::/(hb|eb)(\d\d)(\d\d\d)/
// putimg(obj, filename) : Función Interna
// resetsoroban() : Reseteo
// setsoroban(heavens, earths) :  heavens::/[uVWX]+/  earths::/[0-5]+/
// undosoroban() : Deshacer
// redosoroban() : Rehacer
// encodeAbacus() : Codificar a las expresión /[uVWX]+:[0-5]+/ 
// drawAbacus(numOf5s, numOf1s, numOfDigits, numOfClusters): Dibuja el soroban en su marco (sorofield)
// playsound() : Efecto de sonido
// playsoundClear() : Efeto de sonido (Clear)
// soundToggle() : Alternar sonido
let resourcedir = "./soroban/";
let imgfilename0 = "soroban0.gif";
let imgfilename1 = "soroban1.gif";
let imgfilenameU = "sorobanU.gif";
let imgfilenameL = "sorobanL.gif";
let imgfilenameB0 = "soroband0.gif";
let imgfilenameB1 = "soroband1.gif";

let digitsoroban;
let heavenBeads;
let earthBeads;

let digitclusters;
let shiftkey = false;

let undoBuffer = [];
let redoBuffer = [];

let initialPatternBuffer = [];
let exitPatternBuffer = [];
let tutorialBuffer = [];
let pagePointer = 0;

let bucket = [];
let soundFlag = true;


//
// Movimiento de las cuentas
//
function mv(name) {
  let hore = name.substring(0, 2);
  let indexY = name.substring(2, 4);
  let indexX = name.substring(4);
  let img = document.images[name].src;
  if (img.indexOf(imgfilename0) < 0) {  
    undoBuffer.push(encodeAbacus());
    document.getElementById("UNDO").disabled=false;
    redoBuffer = [];
    document.getElementById("REDO").disabled=true;
    playsound();
    if (hore == 'hb') {  // Cuentas cielo
      for (i = 0; i <= heavenBeads; i++) {
        putimg(hore + indexY + i, imgfilename1);
      }
      if ((heavenBeads > 1) && shiftkey && indexX <= 1) {
        putimg(hore + indexY + 0, imgfilenameU);
        putimg(hore + indexY + 1, imgfilenameL);
      } else {
        putimg(name, imgfilename0);
      }
    } else {  // Cuentas tierra
      for (i = 0; i <= earthBeads; i++) {
        putimg(hore + indexY + i, imgfilename1);
      }
      putimg(name, imgfilename0);
    }
    updateDisplay(); // Agregar llamada a updateDisplay después de cada movimiento de cuentas
  }
}

function putimg(objname, filename) {
  if (document.images[objname].src.indexOf(filename) < 0) {
    document.images[objname].src = resourcedir + filename;
  }
}

//
// Reiniciar el campo y los buffers de deshacer/rehacer
//
function resetsoroban() {
  setsoroban('', '');
  undoBuffer = [];
  redoBuffer= [];
  document.getElementById("UNDO").disabled=true;
  document.getElementById("REDO").disabled=true;
  playsoundClear();
  updateDisplay();
}


// Calcula el valor numérico del ábaco (Función Nueva)
function updateDisplay() {
  let heavenValue = '';
  let earthValue = '';

  for (let i = 0; i < digitsoroban; i++) {
    const common = 'hb' + ("00" + i).slice(-2);

    if (heavenBeads == 2) {
      if (document.images[common + '0'].src.indexOf(imgfilenameU) >= 0) {
        heavenValue += '0';
      } else if (document.images[common + '0'].src.indexOf(imgfilename0) >= 0) {
        heavenValue += '0';
      } else if (document.images[common + '1'].src.indexOf(imgfilename0) >= 0) {
        heavenValue += '5';
      } else {
        heavenValue += '0';
      }
    } else {
      if (document.images[common + '0'].src.indexOf(imgfilename0) >= 0) {
        heavenValue += '5';
      } else {
        heavenValue += '0';
      }
    }

    const earthCommon = 'eb' + ("00" + i).slice(-2);
    let j = 0;
    while (document.images[earthCommon + j].src.indexOf(imgfilename1) >= 0) {
      j++;
    }

    earthValue = earthValue + j.toString();
  }

  const heavenNumber = parseInt(heavenValue, 10);
  const earthNumber = parseInt(earthValue, 10);

  // Calcula la suma de heavenNumber y earthNumber
  const totalValue = heavenNumber + earthNumber;

  // Aplica el formato con espacios de mil al número
  const formattedTotalValue = formatNumberWithSpaces(totalValue);

  // Muestra el valor total en el elemento con id "display"
  document.getElementById("display").textContent = formattedTotalValue;
} 

// Función para dar formato al número con espacios de mil (formarto números de España)
function formatNumberWithSpaces(number) {
  // Convierte el número a una cadena
  const numberStr = number.toString();

  // Si el número tiene cuatro cifras, no separamos con espacios
  if (numberStr.length === 4) {
      return numberStr;
  }

  // Divide la cadena en grupos de tres cifras desde el final
  const groups = [];
  let i = numberStr.length;
  while (i > 0) {
      groups.push(numberStr.slice(Math.max(0, i - 3), i));
      i -= 3;
  }

  // Une los grupos con espacios y devuelve el resultado
  return groups.reverse().join(' ');
}

// Establecer patrones desde la representación interna. (/[uVWX]+:[0-5]+/)
//
function setsoroban(heavens, earths) {
  playsound();
  let hvn = heavens.replace(/ +/g, '');
  hvn = hvn + 'u'.repeat(digitsoroban);  // benevolent process
  hvn = hvn.split('');
  let erth = earths.replace(/ +/g, '');
  erth = erth + '0'.repeat(digitsoroban);  // benevolent process
  erth = erth.split('');
  for (i = 0; i < digitsoroban; i++) {
    common = 'hb' +  ("00" +  i).slice(-2);
    switch (hvn.shift().toUpperCase()) {
      case 'X' :
        putimg(common + '0', imgfilenameU);
        putimg(common + '1', imgfilenameL);
        putimg(common + '2', imgfilename1);
        break;
      case 'W' :
        putimg(common + '0', imgfilename0);
        putimg(common + '1', imgfilename1);
        putimg(common + '2', imgfilename1);
        break;
      case 'V' :
        if (heavenBeads == 2) {
          putimg(common + '0', imgfilename1);
          putimg(common + '1', imgfilename0);
          putimg(common + '2', imgfilename1);
        } else {
          putimg(common + '0', imgfilename0);
          putimg(common + '1', imgfilename1);
        }
        break;
      default :
        if (heavenBeads == 2) {
          putimg(common + '0', imgfilename1);
          putimg(common + '1', imgfilename1);
          putimg(common + '2', imgfilename0);
        } else {
          putimg(common + '0', imgfilename1);
          putimg(common + '1', imgfilename0);
        }
        break;
    }
    common = 'eb' +  ("00" +  i).slice(-2);
    for (j = 0; j <= earthBeads; j++) {
      putimg(common + j, imgfilename1);
    }
    putimg(common + Math.min(erth.shift(), earthBeads), imgfilename0);
  }
  updateDisplay();
}

// Deshacer
//
function undosoroban() {
  playsound();
  redoBuffer.push(encodeAbacus());
  document.getElementById("REDO").disabled=false;
  data = undoBuffer.pop();
  if (undoBuffer.length == 0) {
    document.getElementById("UNDO").disabled=true;
  }
  ary = data.split(':');
  setsoroban(ary[0], ary[1]);
  updateDisplay();
}

//
// Rehacer
//
function redosoroban() {
  playsound();
  undoBuffer.push(encodeAbacus());
  document.getElementById("UNDO").disabled=false;
  data = redoBuffer.pop();
  if (redoBuffer.length == 0) {
    document.getElementById("REDO").disabled=true;
  }
  ary = data.split(':');
  setsoroban(ary[0], ary[1]);
  updateDisplay();
}

//
// Generar representación interna desde el campo (/[uVWX]+:[0-5]+/)
//
function encodeAbacus() {
  let heavenWork = '';
  let earthWork = '';
  for (i = 0; i < digitsoroban; i++) {
    common = 'hb' +  ("00" +  i).slice(-2);
    if (heavenBeads == 2) {
      if (document.images[common+'0'].src.indexOf(imgfilenameU) >= 0) {
        heavenWork = heavenWork + 'X';
      } else if (document.images[common+'0'].src.indexOf(imgfilename0) >= 0) {
        heavenWork = heavenWork + 'W';
      } else if (document.images[common+'1'].src.indexOf(imgfilename0) >= 0) {
        heavenWork = heavenWork + 'V';
      } else {
        heavenWork = heavenWork + 'u';
      }
    } else {
      if (document.images[common+'0'].src.indexOf(imgfilename0) >= 0) {
        heavenWork = heavenWork + 'V';
      } else {
        heavenWork = heavenWork + 'u';
      }
    }
    common = 'eb' +  ("00" +  i).slice(-2);
    j = 0;
    while (document.images[common+j].src.indexOf(imgfilename1) >= 0) {
      j++;
    }
    earthWork = earthWork + j;
  }
  return heavenWork+':'+earthWork;
}

function updateAbacus() {
  const numOfDigitsSelect = document.getElementById("numOfDigits");
  const selectedValue = parseInt(numOfDigitsSelect.value, 10);
  drawAbacus(1, 4, selectedValue, 3);
}

// 
// Dibujar campo (número de cuentas Cielo, número de cuentas Tierra, dígitos, dígitos separadores)
// Función modificada respecto a la original, aunque hemos mantenido la estructura
//
function drawAbacus(numOf5s, numOf1s, numOfDigits, numOfClusters) {
  let pointOffset = Math.trunc(numOfDigits / 2)  % numOfClusters;
  heavenBeads = numOf5s;
  earthBeads = numOf1s;
  digitsoroban = numOfDigits;
  digitclusters = numOfClusters;
  let html = "<TABLE class='soroban' BORDER='0' CELLPADDING='0' CELLSPACING='0' STYLE='border:16px ridge brown;background-color:#cccccc;'>\n";
  html += "<TR ALIGN='center' VALIGN='bottom'><TD NOWRAP>\n";
  for (let j = 0; j <= numOf5s; j++) {  
    for (let i = 0; i < numOfDigits; i++) {
      html += "<A HREF='JavaScript:mv(";
      html += '"hb' + ("00" +  i).slice(-2) + j + '");';        
      html += "'>";                     
      html += "<IMG class='varilla' NAME='hb" + ("00" +  i).slice(-2) + j + "' src='";
      if (j < numOf5s) {
        html += resourcedir + imgfilename1;             
      } else {
        html += resourcedir + imgfilename0;             
      }
      html += "' BORDER='0' VSPACE='0' HSPACE='0'></a>";
    }
    html += "<BR>\n";
  }
  html += "</TD>\n</TR>\n<TR ALIGN='center' VALIGN='middle'>\n";
  if (numOf5s == 2) {
    beam = makeBeamImage(numOfDigits);
    html += "<TD NOWRAP STYLE='background-color:black;'>";
    html += "<IMG src='" + beam + "' BORDER='0' VSPACE='0' HSPACE='0'>";
    html += "</TD>\n</TR>\n<TR ALIGN='center' VALIGN='top'>\n";
  } else {
    html += "<TD NOWRAP STYLE='background-color:black;'>";
    for (let i = 0; i < numOfDigits; i++) {
      html += "<IMG src='";
	if ((i - pointOffset) % numOfClusters == 0) {
        html += resourcedir + imgfilenameB1;            // bar with dot
      } else {
        html += resourcedir + imgfilenameB0;            // bar without dot
      }
      html += "' BORDER='0' VSPACE='0' HSPACE='0'>";
    }
    html += "</TD>\n</TR>\n<TR ALIGN='center' VALIGN='top'>\n";
  }
  html += "<TD NOWRAP>";
  for (let j = 0; j <= numOf1s; j++) {                                  
    for (let i = 0; i < numOfDigits; i++) {
      html += "<A HREF='JavaScript:mv(";
      html += '"eb' + ("00" +  i).slice(-2) + j + '");';
      html += "' >";
      html += "<IMG class='varilla' NAME='eb" + ("00" +  i).slice(-2) + j + "' src='";
      if (j > 0) {
        html += resourcedir + imgfilename1;             // tama
      } else {
        html += resourcedir + imgfilename0;             // jiku
      }
      html += "' BORDER='0' VSPACE='0' HSPACE='0'></a>";
    }
    html += "<BR>\n";
  }
  html += "</TD>\n</TR>\n</TABLE>\n";

 // Caracteres de índice (las letras que aparecen debajo de las cuentas)
 html += "<TABLE BORDER='0' CELLPADDING='0' CELLSPACING='0'>\n";
 html += "<TR ALIGN='center' VALIGN='top'>\n<TD NOWRAP>\n";
 for (let i = numOfDigits - 1; i >= 0; i--) {
   html += "<INPUT TYPE='text' NAME='IDX" + String.fromCharCode(64 + i) + "' SIZE='1' VALUE='" + String.fromCharCode(65+i) + "' MAXLENGTH='1' DISABLED='DISABLED' STYLE='font-size:20px;line-height:100%;width:50px;border:0 solid white;text-align:center;'>";
 }
 html += "</TD>\n</TR>\n</TABLE>\n";

  // Insertar el HTML generado en el elemento sorofield
  document.getElementById("sorofield").innerHTML = html;
}
// Reproducir sonido
//
function playsound(sourcename) {
  if (soundFlag) {
    document.getElementById("se_soroban").currentTime = 0;
    document.getElementById("se_soroban").play();
  }
}

//
// Reproducir sonido (Clear)
//
function playsoundClear(sourcename) {
  if (soundFlag) {
    document.getElementById("se_sorobanClear").currentTime = 0;
    document.getElementById("se_sorobanClear").play();
  }
}

// Generar representación interna desde el formato /[0-9]+/
//
function interpret(num) {
  num = num.replace(/ +/g, '');
  num = num + '0'.repeat(digitsoroban);  // benevolent process
  num = num.split('');
  let hvn = '';
  let erth = '';
  for (i = 0; i < digitsoroban; i++) {
    switch (num[i]) {
      case '0' :
        hvn = hvn + 'u';
        erth = erth + '0';
        break;
      case '1' :
        hvn = hvn + 'u';
        erth = erth + '1';
        break;
      case '2' :
        hvn = hvn + 'u';
        erth = erth + '2';
        break;
      case '3' :
        hvn = hvn + 'u';
        erth = erth + '3';
        break;
      case '4' :
        hvn = hvn + 'u';
        erth = erth + '4';
        break;
      case '5' :
        hvn = hvn + 'V';
        erth = erth + '0';
        break;
      case '6' :
        hvn = hvn + 'V';
        erth = erth + '1';
        break;
      case '7' :
        hvn = hvn + 'V';
        erth = erth + '2';
        break;
      case '8' :
        hvn = hvn + 'V';
        erth = erth + '3';
        break;
      case '9' :
        hvn = hvn + 'V';
        erth = erth + '4';
        break;
      default :
    }
  }
  return hvn + ':' + erth;
}



