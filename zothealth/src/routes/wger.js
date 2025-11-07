const express = require('express');
const https = require('https');
const router = express.Router();

const BASE = 'https://wger.de/api/v2';

function httpGetJson(url){
  return new Promise((resolve, reject)=>{
    const req = https.get(url, { headers: { 'Accept':'application/json' } }, (res)=>{
      const { statusCode } = res;
      if(statusCode < 200 || statusCode >= 300){
        res.resume();
        reject(new Error(`HTTP ${statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', ()=>{
        try{ resolve(JSON.parse(data)); }
        catch(e){ reject(e); }
      });
    });
    req.on('error', reject);
  });
}

// GET /api/wger/exercises?search=push&limit=5
router.get('/exercises', async (req,res,next)=>{
  try{
    const { search = '', limit = 10, language = 2 } = req.query;
    const nameFilter = search ? `&name__icontains=${encodeURIComponent(search)}` : '';
    const listUrl = `${BASE}/exercise/?language=${language}&limit=${limit}${nameFilter}`;
    const data = await httpGetJson(listUrl);
    const items = Array.isArray(data.results) ? data.results : [];

    // Fetch images in parallel and attach first image per exercise
    const withImages = await Promise.all(items.map(async (ex)=>{
      try{
        const imgJson = await httpGetJson(`${BASE}/exerciseimage/?exercise=${ex.id}`);
        const images = Array.isArray(imgJson.results) ? imgJson.results : [];
        const primary = images.find(i=>i.is_main) || images[0];
        return {
          id: ex.id,
          name: ex.name,
          category: ex.category,
          description: ex.description, // HTML from wger
          images: images.map(i=>({ url: i.image, isMain: i.is_main })),
          image: primary ? primary.image : null,
          muscles: ex.muscles,
          equipment: ex.equipment,
        };
      }catch{
        return {
          id: ex.id,
          name: ex.name,
          category: ex.category,
          description: ex.description,
          images: [],
          image: null,
          muscles: ex.muscles,
          equipment: ex.equipment,
        };
      }
    }));

    res.json({ count: withImages.length, results: withImages });
  }catch(err){ next(err); }
});

module.exports = router;
