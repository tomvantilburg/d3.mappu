  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'vector';
      var _data = [];                         
	  var drawboard;
	  var _duration = config.duration || 0;
	  var path;
	    
	  
      /* exposed properties*/
      Object.defineProperty(layer, 'data', {
        get: function() {
            return _data;
        },
        set: function(array) {
            _data = array;
            draw(false);
        }
      });                                                           
      
      function setStyle(d){
      	  var entity = d3.select(this);
      	  if (d.style){
      	  	  for (var key in d.style) { 
      	  	  	  entity.select('path').style(key, d.style[key]);
      	  	  }
      	  }
      	  if (d._selected){
      	  	  //make halo around entity to show as selected
      	  	  entity.selectAll('.halo').data([1]).enter()
      	  	  	.append('path').attr("d", _path)
      	  	  	.style('stroke', 'blue')
      	  	  	.classed('halo', true);
      	  }
      	  else {
      	  	  entity.selectAll('.halo').remove();
      	  }
      }
      
      function build(d){
      	  d3.select(this).append('path').attr("d", _path)
            .classed(name, true)
            .style('stroke', 'blue');
      }
      
      var draw = function(rebuild){
		  _path = d3.geo.path()
			.projection(layer.map.projection)
			.pointRadius(function(d) {
				if (d._selected){
					return 30; 
				}
				return 4.5;
			});
      	  
      	  
          var drawboard = layer.drawboard;
          if (rebuild){
               drawboard.selectAll('.entity').remove();
          }
          var entities = drawboard.selectAll('.entity').data(_data, function(d){
          	return d.id;
          });
          
          var newentity = entities.enter().append('g')
          	.classed('entity',true)
          	.attr('id',function(d){
                    return 'entity'+ d.id;
            });
          newentity.each(build);
          newentity.each(setStyle);
            
          // Add events from config
          if (config.events){
              config.events.forEach(function(d){
                 newentity.select('path').on(d.event, d.action);
              });
          }
          layer.refresh(rebuild?0:_duration);
      };
      
      var refresh = function(duration){
          var drawboard = layer.drawboard;
          drawboard.style('opacity', this.opacity).style('display',this.visible ? 'block':'none');
          if (layer.visible){
          	  var entities = drawboard.selectAll('.entity');
			  if (config.reproject){
				  entities.select('path').transition().duration(duration).attr("d", _path);
				  entities.each(setStyle);
			  }
			  else {
				//based on: http://bl.ocks.org/mbostock/5914438
				var zoombehaviour = layer.map.zoombehaviour;
				//FIXME: bug in chrome? When zoomed in too much, browser tab stalls on zooming. Probably to do with rounding floats or something..
				drawboard
				  .attr("transform", "translate(" + zoombehaviour.translate() + ")scale(" + zoombehaviour.scale() + ")")
				  .style("stroke-width", 1 / zoombehaviour.scale());
			  }
          }
          else {
          	  drawboard.selectAll('.entity').remove();
          }
      };
      
      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  //                                                                          マップ
  