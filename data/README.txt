FILE
- data.json: file contenente i dati usati dall'app
	https://dl.dropbox.com/s/9vyf6zgxwi9teqn/data.json
- data.test.json: file equivalente al data.json ma usato per fini di test
	https://dl.dropbox.com/s/98b98lh8nzo3vgo/data.test.json
- schema.json: file contenente lo schema che definisce come deve essere strutturato il file data.json per essere correttamente interpretato dall'app
- doc.pdf: file di documentazione generato a partire da schema.json usando docjson (https://github.com/lbovet/docson)

PER AGGIORNARE I DATI DELL'APP
- integrare/modificare i dati relativi ai locali nel file data.json
- modificare data/ora del file (proprietà "date"), se non si modifica la data il file non sarà scaricato da chi ha già l'app installata con il file di quella "versione"
- per la modifica del file si consiglia l'utilizzo di http://jsonschemalint.com/draft4/ (sulla sinistra ci va il contenuto del file schema.json, sulla destra il contenuto del file schema.json), un validatore di struttura che verifica la correttezza del formato json e l'aderenza del contenuto del file alla definizione dello schema

UTILIZZO DEL FILE DI TEST
- il file data.test.json è accessibile dall'app, lo si può scaricare tenendo premuto sopra al banner nella pagina delle informazioni, e poi ricaricare lista e mappa facendo una ricerca
- se si scarica il file di test quello buono sarà poi scaricato nuovamente riavviando l'applicazione
- questa cosa può tornare utile se si devono aggiornare i dati ma prima si vuole testarne la correttezza