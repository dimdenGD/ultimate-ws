/*
Copyright 2024 dimden.dev

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*
Copyright (c) 2011 Einar Otto Stangvik <einaros@gmail.com>
Copyright (c) 2013 Arnout Kazemier and contributors
Copyright (c) 2016 Luigi Pinca and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const { isUtf8 } = require('buffer');

function _isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
  
    while (i < len) {
      if ((buf[i] & 0x80) === 0) {
        // 0xxxxxxx
        i++;
      } else if ((buf[i] & 0xe0) === 0xc0) {
        // 110xxxxx 10xxxxxx
        if (
          i + 1 === len ||
          (buf[i + 1] & 0xc0) !== 0x80 ||
          (buf[i] & 0xfe) === 0xc0 // Overlong
        ) {
          return false;
        }
  
        i += 2;
      } else if ((buf[i] & 0xf0) === 0xe0) {
        // 1110xxxx 10xxxxxx 10xxxxxx
        if (
          i + 2 >= len ||
          (buf[i + 1] & 0xc0) !== 0x80 ||
          (buf[i + 2] & 0xc0) !== 0x80 ||
          (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
          (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
        ) {
          return false;
        }
  
        i += 3;
      } else if ((buf[i] & 0xf8) === 0xf0) {
        // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        if (
          i + 3 >= len ||
          (buf[i + 1] & 0xc0) !== 0x80 ||
          (buf[i + 2] & 0xc0) !== 0x80 ||
          (buf[i + 3] & 0xc0) !== 0x80 ||
          (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
          (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
          buf[i] > 0xf4 // > U+10FFFF
        ) {
          return false;
        }
  
        i += 4;
      } else {
        return false;
      }
    }
  
    return true;
}

module.exports.isValidUTF8 = _isValidUTF8;

if (isUtf8) {
    module.exports.isValidUTF8 = function (buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
    };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
        const isValidUTF8 = require('utf-8-validate');

        module.exports.isValidUTF8 = function (buf) {
            return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
    } catch (e) {}
}