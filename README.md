# fnordcredit-entropia
Open source credit system with entropia flavour

Innovative, easy to use credit system for multiple users that comes with an intuitive design: Create an account and charge or discharge your credit.

## Development
fnordcredit is written in Javascript/Node.js/jQuery/rethinkDB.

To start a local development server, have rethinkDB installed and running, then do the following:

	git clone git@github.com:entropia/fnordcredit.git
	cd fnordcredit
	npm install
	cp config.js.example config.js
	node tools/dbInit.js

As last step, start the local development server using ```npm start``` and point your browser to http://127.0.0.1:8000.

## License
Copyright © 2014 
	silsha &lt;hallo@silsha.me&gt;
	Twi &lt;twi@entropia.de&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
