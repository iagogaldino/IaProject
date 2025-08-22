import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VoiceChatPage } from './voice-chat.page';

describe('VoiceChatPage', () => {
  let component: VoiceChatPage;
  let fixture: ComponentFixture<VoiceChatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
