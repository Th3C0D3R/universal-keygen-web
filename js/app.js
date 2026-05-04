async function generateKey() {
    const PublicKeyXML = "<DSAKeyValue><P>3N35IcqKMJLdrg5HmSYa6duURBVDNZgj7BCnwcz/ufmuTgBqQSf3cxqHNTX31BTKJWBBdfF2LxA+uLRmTXZGzw==</P><Q>hEN4EgQsu/HHDcZh9Qwxg43wkL8=</Q><G>gYixcJeFwqXYS9td15uvi1o5Ontd6U00qjtvo7aPo4ccNB7jt5SGLEBM9RPsYPKnmC8PRBze5gm2MBgZIm4YsQ==</G><Y>RSijtNxu4sTZc50YrQLR19KX3PEsIGSrvcRYdAUKb1nWGJNY0aAdt/E5HtbMbSqIFPI3mLcOYdgxu9WyzGkRNw==</Y><J>AAAAAat+p7co8MRenHZUQ+BsY94gSFBLvhftoBGgwzmSBZZc+PRlV6daw3iAVN6y</J><Seed>J0VzBGcedEyNe+AWgq/mC/Wf9RU=</Seed><PgenCounter>pg==</PgenCounter><X>EaOoelpYoydZvGFMZHUobAPlfSY=</X></DSAKeyValue>";
    const username = document.getElementById('username').value.trim();
    const status = document.getElementById('status');
    const output = document.getElementById('serialOutput');
    const generateBtn = document.getElementById('generate');
    if (!username) {
        status.textContent = "Please enter a username.";
        return;
    }
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    status.textContent = "Generating serial...";

    const num2 = 240000;
    const high = (num2 >> 8) & 0xFF;
    const low = num2 & 0xFF;
    await new Promise(resolve => setTimeout(resolve, 1000));
    const serial = await generateSerialFromXML(username, [high, low], PublicKeyXML);
    await new Promise(resolve => setTimeout(resolve, 1000));

    output.value = serial;
    status.textContent = `Serial generated for '${username}'.`;
    generateBtn.classList.remove('loading');
    generateBtn.disabled = false;
}

async function copySerial() {
    const output = document.getElementById('serialOutput');
    await navigator.clipboard.writeText(output.value);
    const status = document.getElementById('status');
    status.textContent = `Serial copied to Clipboard`;
}