var fs = require( 'fs' );

var fullDataSet = [];

var recursive_reader = function( y, m ) {
  var year = y;
  var month = m;
  var filename = year + '_' + month + '.js';
  var callback = function( error, data ) {
    var dataArray = JSON.parse( data );
    fullDataSet = fullDataSet.concat( dataArray );
    month++;
    if( month > 12 ) {
      month = 1;
      year++;
    }
    if( year < 2013 ) {
      recursive_reader( year, month );
    } else {
      fs.writeFile( 'data/full.js', JSON.stringify( fullDataSet, null, 2 ), function( error ) {} );
    }
  }
  fs.readFile( 'data/' + filename, 'utf-8', callback );
}

recursive_reader( 2008, 10 );