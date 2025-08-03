import { expect } from "chai";
import {
  encrypt,
  decrypt,
  encryptWithTwoFactors,
  decryptWithTwoFactors,
} from "./encryption-helper";

describe("encryption helper", () => {
  describe("single factor encryption", () => {
    it("should encrypt and decrypt text correctly", () => {
      const plaintext = "Hello, World!";
      const password = "my-secret-password";

      const encrypted = encrypt(plaintext, password);
      const decrypted = decrypt(encrypted, password);

      expect(decrypted).to.equal(plaintext);
    });

    it("should handle empty string", () => {
      const plaintext = "";
      const password = "my-secret-password";

      const encrypted = encrypt(plaintext, password);
      const decrypted = decrypt(encrypted, password);

      expect(decrypted).to.equal(plaintext);
    });

    it("should handle special characters and unicode", () => {
      const plaintext = "Hello 世界! 🚀 测试";
      const password = "my-secret-password";

      const encrypted = encrypt(plaintext, password);
      const decrypted = decrypt(encrypted, password);

      expect(decrypted).to.equal(plaintext);
    });

    it("should handle long text", () => {
      const plaintext = "A".repeat(1000);
      const password = "my-secret-password";

      const encrypted = encrypt(plaintext, password);
      const decrypted = decrypt(encrypted, password);

      expect(decrypted).to.equal(plaintext);
    });

    it("should produce different ciphertext for same plaintext with different passwords", () => {
      const plaintext = "Hello, World!";
      const password1 = "password1";
      const password2 = "password2";

      const encrypted1 = encrypt(plaintext, password1);
      const encrypted2 = encrypt(plaintext, password2);

      expect(encrypted1.ciphertext).to.not.equal(encrypted2.ciphertext);
    });

    it("should produce different ciphertext for same plaintext and password (due to random salt/iv)", () => {
      const plaintext = "Hello, World!";
      const password = "my-secret-password";

      const encrypted1 = encrypt(plaintext, password);
      const encrypted2 = encrypt(plaintext, password);

      expect(encrypted1.ciphertext).to.not.equal(encrypted2.ciphertext);
      expect(encrypted1.iv).to.not.equal(encrypted2.iv);
      expect(encrypted1.salt).to.not.equal(encrypted2.salt);
    });

    it("should fail decryption with wrong password", () => {
      const plaintext = "Hello, World!";
      const correctPassword = "correct-password";
      const wrongPassword = "wrong-password";

      const encrypted = encrypt(plaintext, correctPassword);

      expect(() => decrypt(encrypted, wrongPassword)).to.throw();
    });

    it("should fail decryption with corrupted payload", () => {
      const plaintext = "Hello, World!";
      const password = "my-secret-password";

      const encrypted = encrypt(plaintext, password);
      const corruptedPayload = {
        ...encrypted,
        ciphertext: "corrupted-ciphertext",
      };

      expect(() => decrypt(corruptedPayload, password)).to.throw();
    });

    it("should fail decryption with corrupted auth tag", () => {
      const plaintext = "Hello, World!";
      const password = "my-secret-password";

      const encrypted = encrypt(plaintext, password);
      const corruptedPayload = {
        ...encrypted,
        tag: "corrupted-tag",
      };

      expect(() => decrypt(corruptedPayload, password)).to.throw();
    });

    it("should have correct payload structure", () => {
      const plaintext = "Hello, World!";
      const password = "my-secret-password";

      const encrypted = encrypt(plaintext, password);

      expect(encrypted).to.have.property("iv");
      expect(encrypted).to.have.property("salt");
      expect(encrypted).to.have.property("ciphertext");
      expect(encrypted).to.have.property("tag");

      expect(encrypted.iv).to.be.a("string");
      expect(encrypted.salt).to.be.a("string");
      expect(encrypted.ciphertext).to.be.a("string");
      expect(encrypted.tag).to.be.a("string");

      // Check that hex strings are valid
      expect(encrypted.iv).to.match(/^[0-9a-f]+$/);
      expect(encrypted.salt).to.match(/^[0-9a-f]+$/);
      expect(encrypted.ciphertext).to.match(/^[0-9a-f]+$/);
      expect(encrypted.tag).to.match(/^[0-9a-f]+$/);
    });
  });

  describe("two factor encryption", () => {
    it("should encrypt and decrypt text correctly with two factors", () => {
      const plaintext = "Hello, World!";
      const userPassword = "user-password";
      const serverSecret = "server-secret";

      const encrypted = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );
      const decrypted = decryptWithTwoFactors(
        encrypted,
        userPassword,
        serverSecret
      );

      expect(decrypted).to.equal(plaintext);
    });

    it("should handle empty string with two factors", () => {
      const plaintext = "";
      const userPassword = "user-password";
      const serverSecret = "server-secret";

      const encrypted = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );
      const decrypted = decryptWithTwoFactors(
        encrypted,
        userPassword,
        serverSecret
      );

      expect(decrypted).to.equal(plaintext);
    });

    it("should handle special characters and unicode with two factors", () => {
      const plaintext = "Hello 世界! 🚀 测试";
      const userPassword = "user-password";
      const serverSecret = "server-secret";

      const encrypted = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );
      const decrypted = decryptWithTwoFactors(
        encrypted,
        userPassword,
        serverSecret
      );

      expect(decrypted).to.equal(plaintext);
    });

    it("should handle long text with two factors", () => {
      const plaintext = "A".repeat(1000);
      const userPassword = "user-password";
      const serverSecret = "server-secret";

      const encrypted = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );
      const decrypted = decryptWithTwoFactors(
        encrypted,
        userPassword,
        serverSecret
      );

      expect(decrypted).to.equal(plaintext);
    });

    it("should produce different ciphertext for same plaintext with different factors", () => {
      const plaintext = "Hello, World!";
      const userPassword1 = "user1";
      const userPassword2 = "user2";
      const serverSecret = "server-secret";

      const encrypted1 = encryptWithTwoFactors(
        plaintext,
        userPassword1,
        serverSecret
      );
      const encrypted2 = encryptWithTwoFactors(
        plaintext,
        userPassword2,
        serverSecret
      );

      expect(encrypted1.ciphertext).to.not.equal(encrypted2.ciphertext);
    });

    it("should produce different ciphertext for same plaintext and factors (due to random salt/iv)", () => {
      const plaintext = "Hello, World!";
      const userPassword = "user-password";
      const serverSecret = "server-secret";

      const encrypted1 = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );
      const encrypted2 = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );

      expect(encrypted1.ciphertext).to.not.equal(encrypted2.ciphertext);
      expect(encrypted1.iv).to.not.equal(encrypted2.iv);
      expect(encrypted1.saltUser).to.not.equal(encrypted2.saltUser);
      expect(encrypted1.saltServer).to.not.equal(encrypted2.saltServer);
    });

    it("should fail decryption with wrong user password", () => {
      const plaintext = "Hello, World!";
      const correctUserPassword = "correct-user-password";
      const wrongUserPassword = "wrong-user-password";
      const serverSecret = "server-secret";

      const encrypted = encryptWithTwoFactors(
        plaintext,
        correctUserPassword,
        serverSecret
      );

      expect(() =>
        decryptWithTwoFactors(encrypted, wrongUserPassword, serverSecret)
      ).to.throw();
    });

    it("should fail decryption with wrong server secret", () => {
      const plaintext = "Hello, World!";
      const userPassword = "user-password";
      const correctServerSecret = "correct-server-secret";
      const wrongServerSecret = "wrong-server-secret";

      const encrypted = encryptWithTwoFactors(
        plaintext,
        userPassword,
        correctServerSecret
      );

      expect(() =>
        decryptWithTwoFactors(encrypted, userPassword, wrongServerSecret)
      ).to.throw();
    });

    it("should fail decryption with corrupted payload", () => {
      const plaintext = "Hello, World!";
      const userPassword = "user-password";
      const serverSecret = "server-secret";

      const encrypted = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );
      const corruptedPayload = {
        ...encrypted,
        ciphertext: "corrupted-ciphertext",
      };

      expect(() =>
        decryptWithTwoFactors(corruptedPayload, userPassword, serverSecret)
      ).to.throw();
    });

    it("should fail decryption with corrupted auth tag", () => {
      const plaintext = "Hello, World!";
      const userPassword = "user-password";
      const serverSecret = "server-secret";

      const encrypted = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );
      const corruptedPayload = {
        ...encrypted,
        tag: "corrupted-tag",
      };

      expect(() =>
        decryptWithTwoFactors(corruptedPayload, userPassword, serverSecret)
      ).to.throw();
    });

    it("should have correct payload structure for two factors", () => {
      const plaintext = "Hello, World!";
      const userPassword = "user-password";
      const serverSecret = "server-secret";

      const encrypted = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );

      expect(encrypted).to.have.property("iv");
      expect(encrypted).to.have.property("saltUser");
      expect(encrypted).to.have.property("saltServer");
      expect(encrypted).to.have.property("ciphertext");
      expect(encrypted).to.have.property("tag");

      expect(encrypted.iv).to.be.a("string");
      expect(encrypted.saltUser).to.be.a("string");
      expect(encrypted.saltServer).to.be.a("string");
      expect(encrypted.ciphertext).to.be.a("string");
      expect(encrypted.tag).to.be.a("string");

      // Check that hex strings are valid
      expect(encrypted.iv).to.match(/^[0-9a-f]+$/);
      expect(encrypted.saltUser).to.match(/^[0-9a-f]+$/);
      expect(encrypted.saltServer).to.match(/^[0-9a-f]+$/);
      expect(encrypted.ciphertext).to.match(/^[0-9a-f]+$/);
      expect(encrypted.tag).to.match(/^[0-9a-f]+$/);
    });

    it("should be secure against known plaintext attacks", () => {
      const plaintext = "Hello, World!";
      const userPassword = "user-password";
      const serverSecret = "server-secret";

      const encrypted1 = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );
      const encrypted2 = encryptWithTwoFactors(
        plaintext,
        userPassword,
        serverSecret
      );

      // Even with same plaintext and factors, ciphertext should be different
      expect(encrypted1.ciphertext).to.not.equal(encrypted2.ciphertext);
      expect(encrypted1.iv).to.not.equal(encrypted2.iv);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle very long passwords", () => {
      const plaintext = "Hello, World!";
      const longPassword = "A".repeat(1000);

      const encrypted = encrypt(plaintext, longPassword);
      const decrypted = decrypt(encrypted, longPassword);

      expect(decrypted).to.equal(plaintext);
    });

    it("should handle very short passwords", () => {
      const plaintext = "Hello, World!";
      const shortPassword = "a";

      const encrypted = encrypt(plaintext, shortPassword);
      const decrypted = decrypt(encrypted, shortPassword);

      expect(decrypted).to.equal(plaintext);
    });

    it("should handle passwords with special characters", () => {
      const plaintext = "Hello, World!";
      const specialPassword = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

      const encrypted = encrypt(plaintext, specialPassword);
      const decrypted = decrypt(encrypted, specialPassword);

      expect(decrypted).to.equal(plaintext);
    });

    it("should handle binary data as string", () => {
      const plaintext = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]).toString(
        "utf8"
      );
      const password = "my-secret-password";

      const encrypted = encrypt(plaintext, password);
      const decrypted = decrypt(encrypted, password);

      expect(decrypted).to.equal(plaintext);
    });
  });
});
