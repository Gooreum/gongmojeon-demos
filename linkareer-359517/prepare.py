"""Agent 계산 결과를 오프라인 웹 자산으로 묶고 로컬 웹과 동기화한다."""
from pathlib import Path
import sys, json, subprocess, shutil
BASE = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BASE/'agent'))
from jangnal.tools import Tools
from jangnal.render import document
WEB=BASE/'poc/web'
DATA=WEB/'data'
if '--refresh' in sys.argv:
    subprocess.run([sys.executable, str(BASE/'agent/run.py'),'--export',str(DATA)],check=True)
t=Tools()
payload={'markets':t.markets,'results':{},'documents':{},'html':{},'highlights':{},'checks':[]}
# 실측 원문을 그대로 동봉한다. 화면의 합계는 이 기록에서 계산한다.
payload['llmBench']=json.loads((BASE/'agent/out/llm-bench.json').read_text(encoding='utf-8'))
for path in sorted(DATA.glob('*.json')):
    if path.name == 'bundle.json': continue
    result=json.loads(path.read_text())
    if not isinstance(result,dict) or 'market' not in result: continue
    key=result['market']['id']+'|'+result['period']
    payload['results'][key]=result
    payload['documents'][key]={}
    if result.get('needs_confirm'):
        from jangnal.agent import Agent
        result=Agent().run(market=result['market']['id'],period=result['period'],confirmed=True)
        payload['results'][key+'|confirmed']=result
    for kind in ('check','observe','opinion'):
        name=path.stem+'-'+kind+'.html'
        html=document(result,kind)
        (DATA/name).write_text(html)
        payload['documents'][key][kind]=name
        payload['html'][name]=html
for period in ('2018여름','2020봄'):
    rows=t.split_routes(['0002022','1002022','0004236'],period,4)['routes']
    payload['highlights']['inner|'+period]=next(r for r in rows if r['line']=='880-1')
    rows=t.split_routes(['0001914'],period,4)['routes']
    payload['highlights']['road|'+period]=t.detect_cycle(['0001914'],period)
hallim=t.resolve_market('한림민속오일장')
stats,_,_=t._stats(t._daily(hallim['stop_ids'],'2018-09-30','783'),4)
payload['highlights']['hallim783']=stats
quote=(BASE/'agent/data/timetable/x_405085.txt').read_text()
payload['highlights']['hallimQuote']=next(line.strip() for line in quote.splitlines() if '※한림오일시장 O표시 경유' in line)
payload['highlights']['hallimSource']='제주버스정보시스템 783-1번 공개 시간표'
check=subprocess.run([sys.executable,str(BASE/'agent/run.py'),'--check'],capture_output=True,text=True,check=True).stdout
(DATA/'check.txt').write_text(check)
from run import check_report
payload['checks'] = check_report()['checks']
payload['exportedAt']='2026-10-28'
raw=json.dumps(payload,ensure_ascii=False).replace('<','\\u003c')
(DATA/'bundle.json').write_text(raw)
(WEB/'data.js').write_text('window.JANGNAL_DATA = '+raw+';\n')
# 구 시안의 인라인 화면을 남기지 않는다. 출력 HTML은 개별 A4 서식만 보관한다.
(DATA/'index.html').unlink(missing_ok=True)
t.close()
if (WEB/'index.html').exists():
    dest=BASE/'agent/web'
    for name in ('index.html','style.css','app.js','data.js','LICENSES.md'):
        if (WEB/name).exists(): shutil.copy2(WEB/name,dest/name)
    for name in ('data','fonts'):
        shutil.copytree(WEB/name,dest/name,dirs_exist_ok=True)
print('웹 자산 생성 완료: 결과 '+str(len(payload['results']))+'건, 재현 확인 '+str(len(payload['checks']))+'건')
