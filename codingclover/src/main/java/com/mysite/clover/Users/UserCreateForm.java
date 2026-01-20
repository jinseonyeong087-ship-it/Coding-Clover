package com.mysite.clover.Users;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateForm {
  @Size(min = 4, max = 50, message = "사용자ID는 4자 이상 50자 이하로 입력해주세요.")
  @NotEmpty(message = "사용자ID는 필수항목입니다.")
  private String loginId;

  @NotEmpty(message = "비밀번호는 필수항목입니다.")
  @Size(min = 8, message = "비밀번호는 8자 이상 입력해주세요.")
  private String password;

  @NotEmpty(message = "비밀번호 확인은 필수항목입니다.")
  private String passwordConfirm;

  @NotEmpty(message = "이름은 필수항목입니다.")
  private String name;

  @NotEmpty(message = "이메일은 필수항목입니다.")
  @Email(message = "이메일 형식이 올바르지 않습니다.")
  private String email;

  @NotEmpty(message = "회원 역할은 필수항목입니다.")
  private String role; // "STUDENT" or "INSTRUCTOR"
}
