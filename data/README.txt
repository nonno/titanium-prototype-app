FILE
- data.json: file contenente i dati usati dall'app
- data.test.json: file equivalente al data.json ma usato per fini di test
- schema.json: file contenente lo schema che definisce come deve essere strutturato il file data.json per essere correttamente interpretato dall'app
- doc.pdf: file di documentazione generato a partire da schema.json usando docjson (https://github.com/lbovet/docson)

PER AGGIORNARE I DATI DELL'APP
- integrare/modificare i dati relativi ai locali nel file data.json
- modificare data/ora del file (proprietà "date"), se non si modifica la data il file non sarà scaricato da chi ha già l'app installata con il file di quella "versione"
- per la modifica del file si consiglia l'utilizzo di http://jsonschemalint.com/draft4/ (sulla sinistra ci va il contenuto del file schema.json, sulla destra il contenuto del file schema.json), un validatore di struttura che verifica la correttezza del formato json e l'aderenza del contenuto del file alla definizione dello schema