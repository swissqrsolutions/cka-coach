"""Narration for the story videos: content/videos/<n>.json -> site/media/<n>/s<i>.mp3 (+ quiz feedback s<i>-o<j>.mp3).
Free Microsoft voices via edge-tts. usage: <python with edge-tts> tools/voice.py 101 [102 ...]"""
import asyncio, json, sys, pathlib, re
import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent.parent

def speakable(t):
    return re.sub(r'--', 'dash dash ', t)

async def say(text, voice, f):
    await edge_tts.Communicate(speakable(text), voice, rate='-6%').save(str(f))

async def one(n):
    spec = json.loads((ROOT / 'content' / 'videos' / f'{n}.json').read_text(encoding='utf-8'))
    voice = spec.get('voice', 'en-GB-SoniaNeural')
    out = ROOT / 'site' / 'media' / str(n)
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob('*.mp3'):
        old.unlink()
    for i, sc in enumerate(spec['scenes'], 1):
        await say(sc['say'], voice, out / f's{i}.mp3')
        for j, o in enumerate(sc.get('quiz', []), 1):
            await say(o['fb'], voice, out / f's{i}-o{j}.mp3')
    print(n, len(list(out.glob('*.mp3'))), 'clips')

async def main():
    for n in sys.argv[1:]:
        await one(n)

asyncio.run(main())
