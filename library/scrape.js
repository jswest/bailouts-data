// Import the right libraries
var http = require( 'http' );
var fs = require( 'fs' );
var cheerio = require( 'cheerio');

// Define the Parser object
var Parser = function( s, filename ) {
  var _this = this;
  var $ = cheerio.load( s );

  this.parseBig = function() {
    _this.table = $('table');
    _this.thead = _this.table.find('thead');
    _this.tbody = _this.table.find('tbody');
  }

  this.setHeaders = function() {
    _this.headers = [];
    _this.thead.find('th').each( function( i, element ) {
      _this.headers.push( $(element).html() );
    });
  }

  this.prepAmount = function( amountString ) {
    var betterAmountString = amountString.replace( /,/g, "" );
    betterAmountString = betterAmountString.replace( /\$/g, "" );
    return parseInt( betterAmountString );
  }

  this.setBody = function() {
    _this.body = [];
    _this.tbody.find('tr').each( function( i, element ) {
      var item = {};
      $(element).find( 'td' ).each( function( i, td ) {
        var contents;
        if( $(td).find('a').length > 0 ) { contents = $(td).find('a').html(); }
        else { contents = $(td).html(); }
        if( _this.headers[i] == "Amount" ) {
          contents = _this.prepAmount( contents );
        }
        item[ _this.headers[i] ] = contents;
      });
      _this.body.push( item );
    });
  }

  this.init = function() {
    _this.parseBig();
    _this.setHeaders();
    _this.setBody();
  }

  this.printJSON = function() {
    fs.writeFile( filename + '.js', JSON.stringify( _this.body, null, 2 ), function( error ) {
      if( error ) { console.log( error ); }
      else { console.log( 'no error!' ); }
    }); 
  }

}

// Define the request-maker recursive function
var RequestMaker = function( month ) {

  var options = {
    host: 'projects.propublica.org',
    path: '/bailout/events/list/2012/' + month
  }

  var pageAsString = '';
  var callback = function( response ) {
    response.on( 'data', function( chunk ) {
      pageAsString += chunk;
    });
    response.on( 'end', function() {
      var p = new Parser( pageAsString, '2012_' + month );
      p.init();
      p.printJSON();
      if( month < 12 ) {
        RequestMaker( month + 1 );
      }
    });
  }

  var request = http.get( options, callback );
  request.end();

}


RequestMaker( 1 );
