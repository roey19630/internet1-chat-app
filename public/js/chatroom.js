// קבוע למרווח בין polling (במילישניות, 10 שניות)
const POLLING_INTERVAL = 10000;

// משתנה לשמירת הזמן האחרון שבו בוצע polling
let lastPollingTime = new Date().toISOString(); // הערך ההתחלתי יהיה הזמן הנוכחי


document.addEventListener('DOMContentLoaded', function () {
    // פונקציה לגלילה אוטומטית לתחתית
    function scrollToBottom() {
        const messageContainer = document.getElementById('messageContainer');
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }


    scrollToBottom(); // קריאה בעת טעינת העמוד

    const searchToggle = document.getElementById('searchToggle');
    const searchBar = document.getElementById('searchBar');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButtonInner');
    const prevButton = document.getElementById('prevResult');
    const nextButton = document.getElementById('nextResult');
    const searchInfo = document.getElementById('searchInfo');
    const cancelSearch = document.getElementById('cancelSearch');
    const messageContainer = document.getElementById('messageContainer');
    const scrollToBottomButton = document.getElementById('scrollToBottomButton');
    const messageInput = document.querySelector('input[name="message"]');
    const sendButton = document.querySelector('button[type="submit"]');

    let searchResults = [];
    let currentIndex = -1;
    let editingMessageId = null; // מזהה ההודעה שנמצאת במצב עריכה

    // הצגת שורת החיפוש
    searchToggle.addEventListener('click', () => {
        welcomeMessage.classList.add('d-none');
        searchBar.classList.remove('d-none');
        searchInput.focus();
    });

    // חיפוש הודעות
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        searchResults = [...messageContainer.children]
            .filter(msg => msg.textContent.toLowerCase().includes(query))
            .reverse(); // הופכים את הסדר כך שהאחרונה תוצג ראשונה
        currentIndex = 0;
        updateSearch(query);
    });

    // מעבר לתוצאה הקודמת
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSearch(searchInput.value.toLowerCase());
        }
    });

    // מעבר לתוצאה הבאה
    nextButton.addEventListener('click', () => {
        if (currentIndex < searchResults.length - 1) {
            currentIndex++;
            updateSearch(searchInput.value.toLowerCase());
        }
    });

    // יציאה מחיפוש
    cancelSearch.addEventListener('click', () => {
        welcomeMessage.classList.remove('d-none');
        searchBar.classList.add('d-none');
        searchResults.forEach(msg => msg.innerHTML = msg.dataset.originalContent); // שחזור תוכן מקורי
        searchInput.value = '';
        searchInfo.textContent = '0 / 0';
    });

    // עדכון תוצאות חיפוש
    function updateSearch(query) {
        searchResults.forEach(msg => msg.innerHTML = msg.dataset.originalContent); // הסרת סימונים קודמים
        if (searchResults.length > 0) {
            const currentMessage = searchResults[currentIndex];

            // סימון הטקסט שנמצא
            const regex = new RegExp(`(${query})`, 'gi');
            const highlightedContent = currentMessage.dataset.originalContent.replace(regex, '<mark>$1</mark>');
            currentMessage.innerHTML = highlightedContent;

            // גלילה לתוצאה
            currentMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            searchInfo.textContent = `${currentIndex + 1} / ${searchResults.length}`;
        } else {
            searchInfo.textContent = '0 / 0'; // אין תוצאות
        }
    }

    // שמירת תוכן מקורי של ההודעות
    [...messageContainer.children].forEach(msg => {
        msg.dataset.originalContent = msg.innerHTML; // שמירת התוכן המקורי
    });

    // עדכון מיקום כפתור גלילה לתחתית
    function updateButtonPosition() {
        const rect = messageContainer.getBoundingClientRect();
        scrollToBottomButton.style.bottom = `${window.innerHeight - rect.bottom + 20}px`;
        scrollToBottomButton.style.right = `${window.innerWidth - rect.right + 20}px`;
    }

    // גלילה לתחתית כשלוחצים על הכפתור
    scrollToBottomButton.addEventListener('click', scrollToBottom);

    // הצגת כפתור גלילה לתחתית כשלא בתחתית
    messageContainer.addEventListener('scroll', () => {
        if (messageContainer.scrollTop + messageContainer.clientHeight < messageContainer.scrollHeight) {
            scrollToBottomButton.style.display = 'block';
        } else {
            scrollToBottomButton.style.display = 'none';
        }
    });

    // קריאה לעדכון מיקום הכפתור בעת טעינה ובכל שינוי גודל חלון
    window.addEventListener('resize', updateButtonPosition);
    updateButtonPosition();

    // מאזין ללחיצות על כפתור ה-delete
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function () {
            const messageId = this.dataset.messageId;

            const confirmed = confirm('Are you sure you want to delete this message?');
            if (!confirmed) return;

            fetch(`chatroom/messages/${messageId}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        // הסתרת ההודעה מה-UI
                        const messageElement = document.getElementById(`message-${messageId}`);
                        if (messageElement) {
                            messageElement.style.display = 'none';
                        }
                    } else {
                        alert('Failed to delete the message.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while deleting the message.');
                });
        });
    });


    // מאזין ללחיצות על כפתור ה-edit
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', function () {
            const messageId = this.dataset.messageId;
            const messageElement = document.getElementById(`message-${messageId}`);
            const messageContent = messageElement.querySelector('.message-content').textContent;

            // העברת הטקסט לשדה הקלט
            messageInput.value = messageContent;
            messageElement.style.backgroundColor = '#fff9c4'; // צביעת ההודעה בצהוב
            editingMessageId = messageId;

            // הוספת אפשרות ביטול עריכה אם לא קיים
            if (!messageElement.querySelector('.cancel-edit-button')) {
                const cancelEditButton = document.createElement('span');
                cancelEditButton.textContent = 'cancel';
                cancelEditButton.className = 'cancel-edit-button';
                cancelEditButton.style.color = 'red';
                cancelEditButton.style.cursor = 'pointer';
                cancelEditButton.style.marginLeft = '10px';
                messageElement.appendChild(cancelEditButton);

                cancelEditButton.addEventListener('click', function () {
                    messageElement.style.backgroundColor = '#d4f8d4'; // שחזור הצבע המקורי
                    messageInput.value = '';
                    editingMessageId = null;
                    cancelEditButton.remove(); // הסרת כפתור הביטול
                });
            }
        });
    });

    // מאזין ללחיצות על כפתור ה-send
    sendButton.addEventListener('click', function (e) {
        if (editingMessageId) {
            e.preventDefault();

            const updatedContent = messageInput.value;

            fetch(`/chatroom/messages/${editingMessageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: updatedContent })
            })
                .then(response => {
                    if (response.ok) {
                        const messageElement = document.getElementById(`message-${editingMessageId}`);
                        messageElement.querySelector('.message-content').textContent = updatedContent;

                        // הצגת טקסט "edited" בהודעה
                        if (!messageElement.querySelector('.edited-label')) {
                            const editedLabel = document.createElement('small');
                            editedLabel.textContent = 'edited';
                            editedLabel.className = 'edited-label';
                            editedLabel.style.color = 'black';
                            editedLabel.style.fontWeight = 'bold';
                            messageElement.querySelector('.message-meta').appendChild(editedLabel);
                        }

                        // שחזור הצבע המקורי והסרת כפתור ה-cancel
                        messageElement.style.backgroundColor = '#d4f8d4';
                        messageInput.value = '';
                        editingMessageId = null;
                        const cancelEditButton = messageElement.querySelector('.cancel-edit-button');
                        if (cancelEditButton) {
                            cancelEditButton.remove();
                        }
                    } else {
                        alert('Failed to update the message.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while updating the message.');
                });
        }
    });

    // הפעלת polling כל POLLING_INTERVAL
    setInterval(performPolling, POLLING_INTERVAL);
});




function performPolling() {
    fetch(`/chatroom/updated-messages?lastPollingTime=${lastPollingTime}`)
        .then(response => response.json())
        .then(data => {
            const { messages } = data;



            // עיבוד ההודעות שהתקבלו
            messages.forEach(message => {
                const messageId = `message-${message.id}`;
                let messageElement = document.getElementById(messageId);

                const formattedDate = new Date(message.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });


                if (message.deleted) {
                    // אם ההודעה מחוקה, נסיר אותה מהתצוגה
                    if (messageElement) {
                        messageElement.remove();
                    }
                } else if (message.edited) {
                    // אם ההודעה נערכה, נעדכן את התוכן שלה
                    if (messageElement) {
                        const messageContent = messageElement.querySelector('.message-content');
                        const messageMeta = messageElement.querySelector('.message-meta');
                        messageContent.textContent = message.content;

                        if (!messageMeta.querySelector('.edited-label')) {
                            const editedLabel = document.createElement('small');
                            editedLabel.textContent = 'edited';
                            editedLabel.style.color = 'black';
                            editedLabel.style.fontWeight = 'bold';
                            messageMeta.appendChild(editedLabel);
                        }
                    }
                } else {
                    // אם ההודעה חדשה, נוסיף אותה לתצוגה
                    if (!messageElement) {
                        messageElement = document.createElement('div');
                        messageElement.id = messageId;
                        messageElement.style.textAlign = 'left';
                        messageElement.style.backgroundColor = '#f0f0f0';
                        messageElement.style.color = 'black';
                        messageElement.style.padding = '10px';
                        messageElement.style.borderRadius = '10px';
                        messageElement.style.marginBottom = '10px';
                        messageElement.style.maxWidth = '70%';
                        messageElement.style.marginRight = 'auto';

                        messageElement.innerHTML = `
                            <div><strong>${message.User.firstName} ${message.User.lastName}</strong></div>
                            <div class="message-content">${message.content}</div>
                            <div class="message-meta">
                                <small style="color: gray;">${formattedDate}</small>
                            </div>
                        `;
                        messageContainer.appendChild(messageElement);
                    }
                }
            });

            // עדכון הזמן של ה-polling האחרון
            lastPollingTime = new Date().toISOString();
        })
        .catch(error => {
            console.error('Error during polling:', error);
        });
}





