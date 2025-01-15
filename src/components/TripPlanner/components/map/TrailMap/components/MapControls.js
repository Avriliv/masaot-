import React from 'react';
import { Box, IconButton, Tooltip, Paper } from '@mui/material';
import {
    LayersOutlined as LayersIcon,
    TerrainOutlined as TerrainIcon,
    Satellite as SatelliteIcon,
    Map as MapIcon,
    Route as RouteIcon
} from '@mui/icons-material';

const MapControls = ({ onLayerChange, onHikingLayerToggle, selectedLayer, showHikingLayer }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                p: 0.5
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Tooltip title="מפת OpenStreetMap" placement="left">
                    <IconButton
                        size="small"
                        color={selectedLayer === 'osm' ? 'primary' : 'default'}
                        onClick={() => onLayerChange('osm')}
                    >
                        <MapIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="תצלום לוויין" placement="left">
                    <IconButton
                        size="small"
                        color={selectedLayer === 'satellite' ? 'primary' : 'default'}
                        onClick={() => onLayerChange('satellite')}
                    >
                        <SatelliteIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="מפה טופוגרפית" placement="left">
                    <IconButton
                        size="small"
                        color={selectedLayer === 'topo' ? 'primary' : 'default'}
                        onClick={() => onLayerChange('topo')}
                    >
                        <TerrainIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="שכבת שבילים מסומנים" placement="left">
                    <IconButton
                        size="small"
                        color={showHikingLayer ? 'primary' : 'default'}
                        onClick={() => onHikingLayerToggle(!showHikingLayer)}
                    >
                        <RouteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );
};

export default MapControls;
