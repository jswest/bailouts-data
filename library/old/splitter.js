var fs = require( 'fs' );
var _ = require( 'underscore' );

var types = [];
var dataByType = {};

var callback = function( error, data ) {
  if( !error ) {
    var all = JSON.parse( data );
    for( var i = 0; i < all.length; i++ ) {
      var item = all[i];
      if( !_.contains( types, item['Type'] ) ) {
        types.push( item['Type'] );
        dataByType[ item['Type'] ] = [];
      }
      dataByType[ item['Type'] ].push( item );
    }
    for( var i = 0; i < types.length; i++ ) {
      var filename = "";
      if( types[i] != "" ) {
        filename = 'data/' + types[i] + '.js';
      } else {
        filename = 'data/unknown.js';
      }
      fs.writeFile(
        'data/' + types[i] + '.js',
        JSON.stringify( dataByType[types[i]], null, 2 ),
        function( error ) {
          if( error ) {
            console.log( error );
          } else {
            console.log( 'written!' );
          }
      });
    }
  } else { console.log( error ); }
}

fs.readFile( 'data/full.js', 'utf-8', callback );