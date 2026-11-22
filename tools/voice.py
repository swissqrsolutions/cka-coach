"""Narration for the story videos: content/videos/<n>.json -> site/media/<n>/s<i>.mp3 (free Microsoft voices via edge-tts).
usage: <python with edge-tts> tools/voice.py 101 [102 ...]"""
import asyncio, json, sys, pathlib
import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent.parent

async def one(n):
    spec = json.loads((ROOT / 'content' / 'videos' / f'{n}.json').read_text(encoding='utf-8'))
    out = ROOT / 'site' / 'media' / str(n)
    out.mkdir(parents=True, exist_ok=True)
    for i, sc in enumerate(spec['scenes'], 1):
        f = out / f's{i}.mp3'
        await edge_tts.Communicate(sc['say'], spec.get('voice', 'en-GB-SoniaNeural'), rate='-8%').save(str(f))
        print(n, f.name, f.stat().st_size // 1024, 'KB')

async def main():
    for n in sys.argv[1:]:
        await one(n)

asyncio.run(main())
