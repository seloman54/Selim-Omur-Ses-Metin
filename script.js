// Tarayıcının Konuşma API'sini (SpeechRecognition) kontrol et
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Eğer tarayıcı desteklemiyorsa kullanıcıyı uyar
if (!window.SpeechRecognition) {
    alert("Maalesef tarayıcınız konuşma tanımayı desteklemiyor. Lütfen Windows üzerinde Chrome veya Edge tarayıcı kullanın.");
} else {
    // Gerekli HTML elemanlarını seç
    const recognition = new SpeechRecognition();
    const talkButton = document.getElementById('talkButton');
    const output = document.getElementById('output');
    const status = document.getElementById('status');
    const languageSelect = document.getElementById('languageSelect');

    let isListening = false;
    let final_transcript = ''; // Tüm konuşmaları biriktir

    // --- Ayarlar ---
    recognition.continuous = true;   // Sürekli dinle (biz bas/bırak ile kontrol edeceğiz)
    recognition.interimResults = true; // Konuşurken geçici sonuçları göster
    recognition.lang = languageSelect.value; // Dil ayarını seçilenden al

    // Dil seçimi değiştiğinde API'nin dilini de değiştir
    languageSelect.onchange = () => {
        recognition.lang = languageSelect.value;
    };

    // --- "BAS KONUŞ" Düğmesi Olayları ---

    // Düğmeye fare ile BASILDIĞINDA:
    talkButton.onmousedown = () => {
        if (!isListening) {
            recognition.start(); // Dinlemeyi başlat
        }
    };

    // Düğme BIRAKILDIĞINDA (veya fare dışarı çekilirse):
    talkButton.onmouseup = () => {
        if (isListening) {
            recognition.stop(); // Dinlemeyi durdur
        }
    };
    // Fare düğme üzerinden çekilirse de dursun (güvenlik önlemi)
    talkButton.onmouseleave = talkButton.onmouseup;


    // --- API Durum Olayları ---

    // Dinleme gerçekten başladığında:
    recognition.onstart = () => {
        isListening = true;
        status.textContent = "Dinleniyor... (Konuşun)";
        talkButton.textContent = "DİNLEMEDE";
        talkButton.classList.add('recording'); // Düğmeyi kırmızı yap
    };

    // Dinleme bittiğinde (manuel durdurma):
    recognition.onend = () => {
        isListening = false;
        status.textContent = "İşlendi. Tekrar 'Bas Konuş'.";
        talkButton.textContent = "BAS KONUŞ";
        talkButton.classList.remove('recording'); // Düğmeyi normale döndür
    };

    // Hata olursa:
    recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
            status.textContent = "HATA: Mikrofon izni vermediniz!";
        } else {
            status.textContent = `Hata: ${event.error}`;
        }
    };

    // Konuşma algılandığında (En önemli kısım):
    recognition.onresult = (event) => {
        let interim_transcript = ''; // Geçici metin

        // Sonuçları döngüye al
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                // Konuşma bittiyse (cümle tamamlandıysa)
                final_transcript += transcript + ' '; // Ana metne ekle
            } else {
                // Henüz konuşuyorsanız
                interim_transcript += transcript;
            }
        }

        // Ana metni (final_transcript) ve o anki geçici metni (interim_transcript) birleştirip göster
        output.value = final_transcript + interim_transcript;
    };
}
