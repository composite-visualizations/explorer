import React, { useEffect, useCallback } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { inject, observer } from "mobx-react";
import { Typography, Slider, Divider } from '@material-ui/core';
import SelectedImage from "./SelectedImage";
// import { Replay } from '@material-ui/icons'
import VISImage from './VISImage'
import Gallery from 'react-photo-gallery';
const url = uri => `http://localhost:5000${uri}`;  //local version

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
  },
  galleryBar: {
    marginTop: '0.6vh',
    marginBottom: '0.6vh',
    width: '100%',
    height: '4vh',
    display: 'flex',
    alignItems: 'center'
  },
  galleryWrap: {
    margin: '1%',
    width: '99%',
    marginRight: 0,
    height: '94%',
    overflowY: 'scroll',
  },
  galleryTest:{
    display: 'flex',
  },
  slider: {
    top: '1%',
    left: '40%',
    width: '20%',
  },
  text: {
    marginLeft: '3%',
  },
  gallery: {
    marginLeft: '3%',
    fontWeight: 500,
    lineHeight: 1.85
  },
  tile: {
    margin: '',
  }
}));

// const PrettoSlider = withStyles({
//   root: {
//     color: '#1A73E8',
//     height: 8,
//   },
//   thumb: {
//     height: 12,
//     width: 12,
//     backgroundColor: '#fff',
//     border: '2px solid currentColor',
//     marginTop: -2,
//     marginLeft: -6,
//     '&:focus, &:hover, &$active': {
//       boxShadow: 'inherit',
//     },
//   },
//   active: {},
//   valueLabel: {
//     left: 'calc(-50% + 4px)',
//   },
//   track: {
//     height: 8,
//     borderRadius: 4,
//   },
//   rail: {
//     height: 8,
//     borderRadius: 4,
//   },
// })(Slider);

function VISGallery({ d }) {
  const classes = useStyles();
  const scaleWidth = 500;
  const scaleHeight = 500;

  // const changeSlider = (e, value) => {
  //   d.imgState.galleryScale = value;
  // }

  // useEffect(() => {
  //   //console.log(imgList[0])
  //   imgList = imgList.map(img => {
  //     img.src = img.src
  //     img.width = img.width * d.imgState.galleryScale;
  //     img.height = img.height * d.imgState.galleryScale;
  //     return img;
  //   });
  //   //console.log(imgList[0])
  // }, [d.imgState.galleryScale]);

  let imgList = d.imgList.length === 0 ? [] : d.imgList.map((img,idx) => {
    const key = img.split('.')[0];
    // //console.log(key)
    const Width = d.imagesSizeData[key]['img_size']['width'] / scaleWidth * d.imgState.galleryScale;
    const Height = d.imagesSizeData[key]['img_size']['height'] / scaleHeight * d.imgState.galleryScale;
    // if(idx === 0)//console.log(Width,Height)
    return { src: url(`/img_src/${img}`), width: Width, height: Height, loading: 'lazy' };
  })
  
  const imageRenderer = useCallback(
    ({ index, left, top, key, photo }) => (
      <SelectedImage
        selected={false}
        key={key}
        margin={"2px"}
        index={index}
        photo={photo}
        left={left}
        top={top}
      />
    ),[]
  );


  return (
    <div className={classes.root}>
      <div className={classes.galleryBar}>
        <Typography className={classes.gallery} variant='h5'>{'Gallery '}</Typography>
        <Typography className={classes.text}>{`${d.imgList.length} figures found`}</Typography>
        {/* <IconButton onClick={() => d.test()}><Replay /></IconButton> */}
        {/* <PrettoSlider
          className={classes.slider}
          value={d.imgState.galleryScale}
          min={0.5}
          max={2}
          step={0.01}
          onChangeCommitted={changeSlider}></PrettoSlider> */}
      </div>
      <Divider id='gallery_divider'></Divider>
      <div className={classes.galleryWrap} id={"gallery_wrap"}>
        {/* <GridList cellHeight={160} className={classes.gridList} cols={3} spacing={10}>
          {d.imgList.length!==0 && d.imgList.slice(0,18).map((tile, i) => {
            return (<GridListTile className={classes.tile}key={i} cols={1}>
              <img src={url(`/img_src/${tile}`)} alt='' onClick={() => d.activeSelectedImgState(tile)} />d.activeSelectedImgState(obj.photo.src.split('/')[-1].split('.')[0])
            </GridListTile>)
          })}
        </GridList> */}
        <Gallery className={classes.galleryTest} photos={imgList} margin={10} renderImage={imageRenderer}></Gallery>
      </div>
      {d.dataState.selectGalleryImg && <VISImage className={classes.visImage} key={d.imgState.imgId}></VISImage>}
    </div>
  );
}


export default inject('d')(observer(VISGallery));