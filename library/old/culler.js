var fs = require( 'fs' );

var culledDataSet = [];

var callback = function( error, data ) {
  if( !error ) {
    var purchases = JSON.parse( data );
    var purchase;
    for( var i = 0; i < purchases.length; i++ ) {
      purchase = purchases[i];
      if( purchase['Amount'] > 500000000 ) {
        culledDataSet.push( purchase );
      }
    }
    fs.writeFile( 'data/culled-purchases.js', JSON.stringify( culledDataSet, null, 2 ), function( error ) {
      if( error) {
        console.log( error );
      } else {
        console.log( 'written!' );
      }
    });
  } else { console.log( error ); }
}

fs.readFile( 'data/types/Purchase.js', callback );